"""One-message email canary gate. Provider, identity, and storage adapters are injected.

No identity provider, token provider, durable attempt store, or live transport is
configured by this module. Missing integrations fail closed. A test transport is
used only by tests; creating a verified policy never sends a message.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import hashlib
import json
import re
import secrets
import threading
from typing import Protocol

from .graph_mail import (AmbiguousGraphDelivery, GraphSendFailure,
                         GraphSendPolicy, LiveSendingDisabled,
                         MicrosoftGraphMailAdapter)


class CanaryBlocked(RuntimeError):
    """The one-message policy or an integration gate did not pass."""


def _canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def _hash(value):
    return hashlib.sha256(_canonical(value).encode("utf-8")).hexdigest()


def _aware(value):
    if not isinstance(value, datetime) or value.tzinfo is None:
        raise ValueError("timezone-aware datetime required")
    return value.astimezone(timezone.utc)


@dataclass(frozen=True)
class ExactMessage:
    company_id: str
    sender: str
    recipient: str
    category: str
    subject: str
    text_body: str
    html_body: str | None = None

    def __post_init__(self):
        for name in ("company_id", "sender", "recipient", "category", "subject", "text_body"):
            value = getattr(self, name)
            if not isinstance(value, str) or not value.strip():
                raise ValueError(f"{name} must be supplied exactly")
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", self.sender.strip()):
            raise ValueError("invalid sender address")
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", self.recipient.strip()):
            raise ValueError("invalid recipient address")
        if "\r" in self.subject or "\n" in self.subject:
            raise ValueError("subject must be a single line")
        if self.html_body is not None:
            raise ValueError("one-message canary is plain-text only until a reviewed HTML approval UI exists")

    @property
    def content_hash(self):
        # Bind all visible message fields, exact addresses, category, and company.
        return _hash({"company_id": self.company_id, "sender": self.sender.strip().casefold(),
                      "recipient": self.recipient.strip().casefold(), "category": self.category,
                      "subject": self.subject, "text_body": self.text_body,
                      "html_body": self.html_body})


@dataclass(frozen=True)
class ApprovalChallenge:
    challenge_id: str
    challenge_hash: str
    message_hash: str
    scope_hash: str
    expires_at: datetime
    review_payload: dict


@dataclass(frozen=True)
class VerifiedHumanDecision:
    """Authenticated reviewer identity plus an explicit local UI decision.

    Entra authenticates the reviewer; the trusted review application binds the
    button action to the currently open challenge. OIDC does not sign the
    decision itself.
    """
    issuer: str
    audience: str
    subject: str
    approved: bool
    challenge_hash: str
    issued_at: datetime
    expires_at: datetime
    assertion_id: str


class HumanApprovalVerifier(Protocol):
    """Verify an identity-provider assertion. No implementation is configured."""
    def verify(self, opaque_assertion: bytes, challenge: ApprovalChallenge) -> VerifiedHumanDecision:
        """Validate identity proof provenance, issuer, audience, expiry, and subject."""
        ...


class MailTokenProvider(Protocol):
    """A provider SDK-backed delegated token interface, not a token storage scheme."""
    principal: str
    tenant_id: str
    granted_scopes: frozenset[str]

    def get_access_token(self, scopes: tuple[str, ...]) -> str:
        """Return an access token only after SDK validation of tenant, user, and scopes."""
        ...


class AttemptStore(Protocol):
    """Approved production store must provide durable atomic unique claims."""
    durable: bool

    def claim_approval(self, assertion_id: str, challenge_hash: str) -> bool: ...
    def claim_send(self, policy_id: str, content_hash: str) -> bool: ...
    def record_result(self, policy_id: str, status: str, detail: str | None = None) -> None: ...


class UnconfiguredHumanApprovalVerifier:
    def verify(self, opaque_assertion, challenge):
        raise CanaryBlocked("No approved human identity provider is configured")


class UnconfiguredAttemptStore:
    durable = False

    def claim_approval(self, assertion_id, challenge_hash):
        return False

    def claim_send(self, policy_id, content_hash):
        return False

    def record_result(self, policy_id, status, detail=None):
        raise CanaryBlocked("No approved attempt store is configured")


@dataclass(frozen=True)
class CanaryPolicy:
    policy_id: str
    message_hash: str
    challenge_hash: str
    assertion_id: str
    reviewer_subject: str
    tenant_id: str
    expires_at: datetime
    max_messages: int = 1


class OneMessageCanary:
    """Deny-by-default controller for one exact message and one recipient.

    Constructing a request and obtaining a reviewer decision does not send mail.
    Sending requires explicit runtime enablement, an approved identity verifier,
    matching tenant-bound delegated token provider, durable atomic attempt store,
    and a Graph adapter constructed by this controller.
    """
    SCOPE = "https://graph.microsoft.com/Mail.Send"
    MAX_APPROVAL_TTL = 900

    def __init__(self, message: ExactMessage, *, tenant_id: str | None = None,
                 expected_issuer: str | None = None, expected_audience: str | None = None,
                 allowed_reviewer_subjects: frozenset[str] = frozenset(),
                 verifier: HumanApprovalVerifier | None = None,
                 attempt_store: AttemptStore | None = None, live_enabled: bool = False):
        self.message = message
        self.tenant_id = tenant_id
        self.expected_issuer = expected_issuer
        self.expected_audience = expected_audience
        self.allowed_reviewer_subjects = frozenset(allowed_reviewer_subjects)
        self.verifier = verifier or UnconfiguredHumanApprovalVerifier()
        self.attempt_store = attempt_store or UnconfiguredAttemptStore()
        self.live_enabled = live_enabled
        self._lock = threading.RLock()
        self._disabled_reason = None
        self._policy = None
        self._challenge = None
        self._state = "draft_only"

    @property
    def state(self):
        return self._state

    @property
    def policy(self):
        return self._policy

    def approval_request(self, *, ttl_seconds=600, now=None):
        """Return the exact review payload and one-time challenge; no provider call."""
        if type(ttl_seconds) is not int or not 60 <= ttl_seconds <= self.MAX_APPROVAL_TTL:
            raise ValueError("approval TTL must be 60..900 seconds")
        now = _aware(now or datetime.now(timezone.utc))
        with self._lock:
            if self._state != "draft_only" or self._disabled_reason:
                raise CanaryBlocked("approval request is not available in this state")
            expires = now + timedelta(seconds=ttl_seconds)
            challenge_id = secrets.token_urlsafe(24)
            scope = {"company_id": self.message.company_id,
                     "sender": self.message.sender.strip().casefold(),
                     "recipient": self.message.recipient.strip().casefold(),
                     "category": self.message.category, "max_messages": 1,
                     "message_hash": self.message.content_hash,
                     "expires_at": expires.isoformat()}
            scope_hash = _hash(scope)
            challenge_hash = _hash({"nonce": challenge_id, "scope_hash": scope_hash})
            payload = {**scope, "subject": self.message.subject,
                       "text_body": self.message.text_body, "html_body": self.message.html_body,
                       "human_decision_required": True,
                       "approval_expires_at": expires.isoformat()}
            self._challenge = ApprovalChallenge(challenge_id, challenge_hash,
                self.message.content_hash, scope_hash, expires, payload)
            self._state = "awaiting_human_approval"
            return payload | {"challenge_id": challenge_id, "challenge_hash": challenge_hash,
                              "scope_hash": scope_hash}

    def accept_assertion(self, opaque_assertion: bytes, *, now=None):
        """Validate authenticated provider assertion and issue a one-message policy."""
        now = _aware(now or datetime.now(timezone.utc))
        with self._lock:
            challenge = self._challenge
            if self._disabled_reason or not challenge or self._state != "awaiting_human_approval":
                raise CanaryBlocked("no open approval challenge")
            if now >= challenge.expires_at:
                self._state = "expired"
                raise CanaryBlocked("approval challenge expired")
            if not isinstance(opaque_assertion, bytes) or not opaque_assertion:
                raise CanaryBlocked("opaque identity-provider assertion required")
            if isinstance(self.verifier, UnconfiguredHumanApprovalVerifier):
                raise CanaryBlocked("No approved human identity provider is configured")
            if not self.expected_issuer or not self.expected_audience or not self.tenant_id or not self.allowed_reviewer_subjects:
                raise CanaryBlocked("identity issuer, audience, tenant, and reviewer allowlist must be configured")
            try:
                decision = self.verifier.verify(opaque_assertion, challenge)
            except Exception as exc:
                raise CanaryBlocked("identity provider did not verify the approval assertion") from exc
            if not isinstance(decision, VerifiedHumanDecision):
                raise CanaryBlocked("identity verifier returned no verified decision")
            issued, expires = _aware(decision.issued_at), _aware(decision.expires_at)
            if decision.issuer != self.expected_issuer or decision.audience != self.expected_audience:
                raise CanaryBlocked("approval assertion issuer/audience mismatch")
            if decision.subject not in self.allowed_reviewer_subjects:
                raise CanaryBlocked("reviewer is not authorized for this pilot")
            if decision.challenge_hash != challenge.challenge_hash:
                raise CanaryBlocked("approval assertion is bound to different message or scope")
            if not decision.assertion_id or issued > now + timedelta(seconds=30) or expires <= now or expires > challenge.expires_at:
                raise CanaryBlocked("approval assertion is invalid or expired")
            if not self.attempt_store.claim_approval(decision.assertion_id, challenge.challenge_hash):
                raise CanaryBlocked("approval assertion replay or attempt store unavailable")
            persist_decision = getattr(self.attempt_store, "set_approval_decision", None)
            if persist_decision:
                persist_decision(decision.assertion_id, challenge.challenge_hash,
                                 "approved" if decision.approved else "denied", decision.subject)
            if decision.approved is not True:
                self._state = "denied"
                self.attempt_store.record_result(challenge.challenge_id, "denied", decision.subject)
                return {"status": "denied", "reviewer_subject": decision.subject}
            policy_id = _hash({"challenge": challenge.challenge_hash, "assertion": decision.assertion_id})
            self._policy = CanaryPolicy(policy_id, challenge.message_hash,
                challenge.challenge_hash, decision.assertion_id, decision.subject,
                self.tenant_id, min(expires, challenge.expires_at), 1)
            self._state = "approved_not_sent"
            self.attempt_store.record_result(policy_id, "approved_not_sent", decision.subject)
            return {"status": self._state, "policy_id": policy_id,
                    "message_hash": challenge.message_hash,
                    "expires_at": self._policy.expires_at.isoformat(),
                    "max_messages": 1}

    def accept_authenticated_decision(self, decision: VerifiedHumanDecision, *, now=None):
        """Record a local UI approve/deny click by an already authenticated reviewer.

        The trusted UI must call this only after its identity adapter has
        authenticated the person and while presenting this controller's open
        challenge. Entra OIDC authenticates the user; this method binds the
        button action to the challenge. It does not claim Entra signed the click.
        """
        if not isinstance(decision, VerifiedHumanDecision):
            raise CanaryBlocked("authenticated reviewer decision required")
        class BoundDecisionVerifier:
            def verify(_self, opaque_assertion, challenge):
                if opaque_assertion != b"local-authenticated-review-action":
                    raise ValueError("review action unavailable")
                if decision.challenge_hash != challenge.challenge_hash:
                    raise ValueError("decision no longer matches visible challenge")
                return decision
        with self._lock:
            previous = self.verifier
            try:
                self.verifier = BoundDecisionVerifier()
                return self.accept_assertion(b"local-authenticated-review-action", now=now)
            finally:
                self.verifier = previous

    def graph_adapter(self, token_provider: MailTokenProvider, *, transport=None,
                      live_enabled=False):
        """Build the exact Graph adapter for this verified policy; disabled by default."""
        policy = self._policy
        if not policy or self._state != "approved_not_sent" or self._disabled_reason:
            raise CanaryBlocked("no approved one-message policy")
        if not self.tenant_id or not token_provider:
            raise CanaryBlocked("tenant-bound Mail.Send token provider is required")
        principal = getattr(token_provider, "principal", None)
        tenant_id = getattr(token_provider, "tenant_id", None)
        scopes = frozenset(getattr(token_provider, "granted_scopes", ()))
        if not isinstance(principal, str) or principal.casefold() != self.message.sender.strip().casefold():
            raise CanaryBlocked("token principal does not match exact sender")
        if tenant_id != self.tenant_id:
            raise CanaryBlocked("token tenant does not match configured tenant")
        if self.SCOPE not in scopes:
            raise CanaryBlocked("verified delegated Mail.Send scope is missing")
        graph_policy = GraphSendPolicy(self.message.company_id, self.message.sender,
            frozenset({self.message.recipient}), frozenset({self.message.category}), 1,
            policy.expires_at, approved=True)
        # live_enabled remains a separate explicit action-time gate; this package
        # does not set it anywhere. Tests inject a mock transport and fake token.
        return MicrosoftGraphMailAdapter(graph_policy, token_provider, transport,
                                         live_enabled=live_enabled)

    def send_once(self, adapter: MicrosoftGraphMailAdapter, *, now=None):
        """Attempt the approved exact message once; ambiguous acceptance stays held."""
        now = _aware(now or datetime.now(timezone.utc))
        with self._lock:
            policy = self._policy
            if not self.live_enabled or self._disabled_reason:
                raise CanaryBlocked("canary sending is disabled")
            if self._state != "approved_not_sent" or not policy:
                raise CanaryBlocked("no unused approval")
            if now >= policy.expires_at:
                self._state = "expired"
                raise CanaryBlocked("send approval expired")
            if self.message.content_hash != policy.message_hash:
                self._state = "invalidated"
                raise CanaryBlocked("exact approved content changed")
            if not getattr(self.attempt_store, "durable", False):
                raise CanaryBlocked("approved durable atomic attempt store is required for a live send")
            if adapter.policy is None or adapter.policy.company_id != self.message.company_id or \
               adapter.policy.sender_address.casefold() != self.message.sender.strip().casefold() or \
               {x.casefold() for x in adapter.policy.allowed_recipients} != {self.message.recipient.strip().casefold()} or \
               adapter.policy.message_categories != frozenset({self.message.category}) or \
               adapter.policy.daily_cap != 1 or adapter.policy.expires_at != policy.expires_at or \
               adapter.token_provider is None or adapter.token_provider.principal.casefold() != self.message.sender.strip().casefold():
                raise CanaryBlocked("Graph adapter policy or sender differs from the approved envelope")
            idem = _hash({"policy_id": policy.policy_id, "message_hash": policy.message_hash})
            if not self.attempt_store.claim_send(policy.policy_id, policy.message_hash):
                raise CanaryBlocked("duplicate send claim rejected")
            self._state = "sending"
        job = {"company_id": self.message.company_id, "sender": self.message.sender,
               "recipient": self.message.recipient, "message_category": self.message.category,
               "company_daily_sent": 0, "idempotency_key": idem}
        draft = {"subject": self.message.subject, "body": self.message.text_body,
                 "body_html": self.message.html_body}
        try:
            result = adapter.send(job, draft)
        except AmbiguousGraphDelivery:
            with self._lock:
                self._state = "ambiguous_hold"
                self.attempt_store.record_result(policy.policy_id, self._state, idem)
            return {"status": self._state, "automatic_retry": False, "idempotency_key": idem}
        except GraphSendFailure as exc:
            with self._lock:
                # A 5xx could occur after server-side work began. Hold it as
                # ambiguous; only a clear non-5xx response is a rejection.
                self._state = "ambiguous_hold" if exc.status >= 500 else "provider_rejected"
                self.attempt_store.record_result(policy.policy_id, self._state, str(exc.status))
            return {"status": self._state, "http_status": exc.status, "automatic_retry": False}
        except Exception:
            # The Graph adapter wraps any transport exception as AmbiguousGraphDelivery.
            # Other exceptions are token/preflight/local failures; the unique claim
            # remains consumed so nothing retries implicitly.
            with self._lock:
                self._state = "local_failure_no_retry"
                self.attempt_store.record_result(policy.policy_id, self._state, "preflight or adapter failure")
            return {"status": self._state, "automatic_retry": False, "idempotency_key": idem}
        with self._lock:
            self._state = "accepted_unconfirmed_delivery"
            self.attempt_store.record_result(policy.policy_id, self._state, idem)
        return {**result, "automatic_retry": False}

    def disable(self, reason="human disabled canary"):
        """Revoke this in-memory gate; cannot undo an accepted or ambiguous email."""
        with self._lock:
            self._disabled_reason = str(reason)[:300]
            self.live_enabled = False
            if self._state in {"draft_only", "awaiting_human_approval", "approved_not_sent"}:
                self._state = "disabled"
            if self._policy and self.attempt_store:
                self.attempt_store.record_result(self._policy.policy_id, "disabled", self._disabled_reason)
            return {"status": self._state, "reason": self._disabled_reason,
                    "message_recall_available": False}

    def cancel_review(self):
        """Cancel an open review without approving or sending its message."""
        with self._lock:
            if self._state == "awaiting_human_approval":
                self._state = "cancelled"
                if self.attempt_store and self._challenge:
                    self.attempt_store.record_result(self._challenge.challenge_id, "cancelled", "review cancelled")
            return {"status": self._state, "send_available": False}

    def expire_review_if_needed(self, *, now=None):
        now = _aware(now or datetime.now(timezone.utc))
        with self._lock:
            if self._state == "awaiting_human_approval" and self._challenge and now >= self._challenge.expires_at:
                self._state = "expired"
                if self.attempt_store:
                    self.attempt_store.record_result(self._challenge.challenge_id, "expired", "approval challenge expired")
            return self._state
