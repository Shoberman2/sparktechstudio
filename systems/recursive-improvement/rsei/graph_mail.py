"""Microsoft Graph sendMail adapter with an injected token interface and hard default gate.

The production transport is implemented but cannot run without an authorized
delegated-token provider, exact company policy, and separately controlled
live_enabled flag. This repository configures none of those.
"""
from dataclasses import dataclass
from datetime import datetime, timezone
import http.client
import json
import re


class LiveSendingDisabled(RuntimeError):
    pass


class AmbiguousGraphDelivery(RuntimeError):
    """The request may have reached Graph; never retry automatically."""


class GraphSendFailure(RuntimeError):
    def __init__(self, status, retry_after=None):
        super().__init__(f"Microsoft Graph returned HTTP {status}")
        self.status = status
        self.retry_after = retry_after


@dataclass(frozen=True)
class GraphSendPolicy:
    company_id: str
    sender_address: str
    allowed_recipients: frozenset
    message_categories: frozenset
    daily_cap: int
    expires_at: datetime
    approved: bool = False

    def __post_init__(self):
        if not self.company_id or not self.sender_address or not self.allowed_recipients or not self.message_categories:
            raise ValueError("Graph policy requires company, sender, recipient allowlist and category")
        if type(self.daily_cap) is not int or not 1 <= self.daily_cap <= 1000:
            raise ValueError("Graph policy cap must be 1..1000")
        if self.expires_at.tzinfo is None:
            raise ValueError("Graph policy expiry must be timezone-aware")


class HttpsGraphTransport:
    """HTTPS-only fixed endpoint transport; redirects are not followed, body isn't logged."""
    def post(self, url, headers, body, timeout=20):
        if url != MicrosoftGraphMailAdapter.endpoint:
            raise ValueError("Only the fixed Graph sendMail endpoint is allowed")
        conn = http.client.HTTPSConnection("graph.microsoft.com", timeout=timeout)
        try:
            conn.request("POST", "/v1.0/me/sendMail", body=body, headers=headers)
            response = conn.getresponse()
            status, response_headers = response.status, dict(response.getheaders())
            response.read(4096)
            return status, response_headers
        finally:
            conn.close()


class MicrosoftGraphMailAdapter:
    """Build and, only under exact injected gates, submit Graph sendMail."""

    endpoint = "https://graph.microsoft.com/v1.0/me/sendMail"
    required_delegated_scope = "https://graph.microsoft.com/Mail.Send"
    provider_name = "microsoft-graph"
    ambiguous_delivery_must_not_retry = True

    def __init__(self, policy=None, token_provider=None, transport=None, live_enabled=False, sent_lookup=None):
        self.policy = policy
        self.token_provider = token_provider
        self.transport = transport or HttpsGraphTransport()
        self.live_enabled = live_enabled
        self.sent_lookup = sent_lookup

    @staticmethod
    def prepare(draft, recipient, html_body=None):
        recipient = recipient.strip()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", recipient):
            raise ValueError("Invalid recipient")
        subject, body = draft.get("subject"), draft.get("body")
        if not isinstance(subject, str) or not subject.strip() or not isinstance(body, str) or not body.strip():
            raise ValueError("A reviewed subject and body are required")
        content = html_body if html_body is not None else body
        content_type = "HTML" if html_body is not None else "Text"
        return {
            "message": {
                "subject": subject,
                "body": {"contentType": content_type, "content": content},
                "toRecipients": [{"emailAddress": {"address": recipient}}],
            },
            "saveToSentItems": True,
        }

    def send(self, job, draft):
        policy = self.policy
        if not self.live_enabled or policy is None or not policy.approved or self.token_provider is None:
            raise LiveSendingDisabled("Microsoft Graph live sending is disabled; no request was sent")
        now = datetime.now(timezone.utc)
        if policy.expires_at.astimezone(timezone.utc) <= now:
            raise LiveSendingDisabled("Microsoft Graph send policy expired; no request was sent")
        if job.get("company_id") != policy.company_id:
            raise LiveSendingDisabled("Company does not match approved Graph policy")
        if job.get("sender", "").casefold() != policy.sender_address.casefold():
            raise LiveSendingDisabled("Sender does not match approved Graph policy")
        principal = getattr(self.token_provider, "principal", "")
        if not isinstance(principal, str) or principal.casefold() != policy.sender_address.casefold():
            raise LiveSendingDisabled("Token provider is not bound to the approved sender mailbox")
        recipient = job.get("recipient", "").casefold()
        if recipient not in {value.casefold() for value in policy.allowed_recipients}:
            raise LiveSendingDisabled("Recipient is outside approved audience")
        if job.get("message_category") not in policy.message_categories:
            raise LiveSendingDisabled("Message category is outside approved policy")
        sent_today = job.get("company_daily_sent")
        if type(sent_today) is not int or sent_today < 0 or sent_today >= policy.daily_cap:
            raise LiveSendingDisabled("Daily cap is missing or exhausted")
        key = job.get("idempotency_key")
        if not isinstance(key, str) or not re.fullmatch(r"[a-f0-9]{64}", key):
            raise ValueError("A stable SHA-256 job idempotency key is required")
        payload = self.prepare(draft, job["recipient"], draft.get("body_html"))
        payload["message"]["internetMessageHeaders"] = [{"name": "x-sparktech-idempotency-key", "value": key}]
        # Token interface is company-specific; this package never stores it.
        access_token = self.token_provider.get_access_token((self.required_delegated_scope,))
        if not isinstance(access_token, str) or not access_token.strip():
            raise LiveSendingDisabled("Delegated token provider returned no access token")
        headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
        try:
            status, response_headers = self.transport.post(self.endpoint, headers, json.dumps(payload).encode("utf-8"))
        except Exception as exc:
            # Could have reached the service. Caller must mark ambiguous; don't retry.
            raise AmbiguousGraphDelivery(key) from exc
        if status != 202:
            retry = response_headers.get("Retry-After") or response_headers.get("retry-after")
            raise GraphSendFailure(status, retry)
        # Graph returns no message ID and 202 is acceptance, not delivery proof.
        return {"status": "accepted_unconfirmed_delivery", "idempotency_key": key, "http_status": 202}

    def lookup(self, company_id, idempotency_key):
        if not self.live_enabled or self.policy is None or not self.policy.approved or company_id != self.policy.company_id:
            raise LiveSendingDisabled("Graph reconciliation is not approved for this company")
        if self.sent_lookup is None:
            return None
        return self.sent_lookup(company_id, idempotency_key)

    @staticmethod
    def reconcile(job, lookup_result):
        """Classify a separately verified mailbox lookup without automatically retrying."""
        if job.get("status") != "ambiguous":
            raise ValueError("Only an ambiguous send can be reconciled")
        if lookup_result == "found":
            return "sent_found_in_mailbox"
        if lookup_result == "definitely_not_sent":
            return "not_sent_human_retry_decision_required"
        return "ambiguous_manual_review_required"
