import threading
import unittest
from dataclasses import replace
from datetime import datetime, timedelta, timezone

from rsei.email_pilot import (ApprovalChallenge, CanaryBlocked, ExactMessage,
    OneMessageCanary, VerifiedHumanDecision)
from rsei.graph_mail import AmbiguousGraphDelivery


NOW = datetime.now(timezone.utc)
SCOPE = OneMessageCanary.SCOPE


class TestOnlyVerifier:
    """Maps opaque fixture bytes to claims; no cryptography or production auth."""
    def __init__(self, decision): self.decision=decision
    def verify(self, opaque_assertion, challenge):
        if opaque_assertion != b"fixture-valid-assertion": raise ValueError("unknown test assertion")
        if self.decision.challenge_hash != challenge.challenge_hash: raise ValueError("bad challenge binding")
        return self.decision


class TestOnlyAttemptStore:
    """In-memory test double for the atomic durable-store contract."""
    durable=True
    def __init__(self):
        self.lock=threading.Lock(); self.approvals=set(); self.sends={}; self.results=[]
    def claim_approval(self, assertion_id, challenge_hash):
        with self.lock:
            if assertion_id in self.approvals: return False
            self.approvals.add(assertion_id); return True
    def claim_send(self, policy_id, content_hash):
        with self.lock:
            if policy_id in self.sends: return False
            self.sends[policy_id]=(content_hash,"claimed"); return True
    def record_result(self, policy_id, status, detail=None):
        with self.lock:
            self.results.append((policy_id,status,detail))
            if policy_id in self.sends: self.sends[policy_id]=(self.sends[policy_id][0],status)


class TestOnlyTokenProvider:
    def __init__(self, principal="spencer@sparktechstudio.com", tenant="test-tenant", scopes=(SCOPE,)):
        self.principal=principal; self.tenant_id=tenant; self.granted_scopes=frozenset(scopes)
        self.calls=[]
    def get_access_token(self, scopes):
        self.calls.append(scopes)
        if not set(scopes) <= self.granted_scopes: raise RuntimeError("scope absent")
        return "test-token-never-a-real-credential"


class TestOnlyTransport:
    def __init__(self, status=202, error=None):
        self.status=status; self.error=error; self.calls=[]
    def post(self, url, headers, body, timeout=20):
        self.calls.append((url,headers,body))
        if self.error: raise self.error
        return self.status, {}


def envelope(**changes):
    fields=dict(company_id="sparktech",sender="spencer@sparktechstudio.com",
        recipient="canary@example.invalid",category="test",subject="Fixture subject",
        text_body="Synthetic body for the local canary test.",html_body=None)
    fields.update(changes)
    return ExactMessage(**fields)


def prepared(*, approved=True, issuer="https://idp.example.invalid", audience="sparktech-mail-review",
             subject="reviewer-123", challenge_hash_override=None, expires=None, tenant="test-tenant",
             message=None, store=None):
    message=message or envelope(); store=store or TestOnlyAttemptStore()
    pilot=OneMessageCanary(message,tenant_id=tenant,expected_issuer=issuer,expected_audience=audience,
        allowed_reviewer_subjects=frozenset({"reviewer-123"}),attempt_store=store)
    review=pilot.approval_request(now=NOW)
    challenge=pilot._challenge
    decision=VerifiedHumanDecision(issuer,audience,subject,approved,
        challenge_hash_override or challenge.challenge_hash,NOW,NOW+timedelta(minutes=5),"assertion-1")
    pilot.verifier=TestOnlyVerifier(decision)
    result=pilot.accept_assertion(b"fixture-valid-assertion",now=NOW)
    token=TestOnlyTokenProvider(tenant=tenant)
    transport=TestOnlyTransport()
    adapter=pilot.graph_adapter(token,transport=transport,live_enabled=True) if approved else None
    pilot.live_enabled=True
    return pilot,review,result,token,transport,adapter,store


class EmailPilotTests(unittest.TestCase):
    def test_defaults_deny_and_no_identity_provider_is_configured(self):
        pilot=OneMessageCanary(envelope())
        pilot.approval_request(now=NOW)
        with self.assertRaisesRegex(CanaryBlocked,"identity provider"):
            pilot.accept_assertion(b"anything",now=NOW)
        self.assertEqual(pilot.state,"awaiting_human_approval")
        self.assertFalse(pilot.live_enabled)

    def test_review_request_binds_exact_envelope_and_one_recipient(self):
        pilot=OneMessageCanary(envelope())
        review=pilot.approval_request(now=NOW)
        self.assertEqual(review["recipient"],"canary@example.invalid")
        self.assertEqual(review["max_messages"],1)
        self.assertEqual(review["message_hash"],pilot.message.content_hash)
        self.assertEqual(review["text_body"],pilot.message.text_body)
        self.assertNotIn("reviewer",review)

    def test_canary_refuses_html_until_review_ui_can_render_it_safely(self):
        with self.assertRaisesRegex(ValueError,"plain-text only"):
            envelope(html_body="<img src='https://tracking.invalid/pixel'>")

    def test_denied_approval_is_terminal(self):
        pilot,_,result,_,_,_,_=prepared(approved=False)
        self.assertEqual(result["status"],"denied")
        with self.assertRaises(CanaryBlocked): pilot.graph_adapter(TestOnlyTokenProvider())

    def test_assertion_replay_is_rejected_across_challenges(self):
        store=TestOnlyAttemptStore()
        prepared(store=store)
        second=OneMessageCanary(envelope(subject="Another exact message"),tenant_id="test-tenant",
            expected_issuer="https://idp.example.invalid",expected_audience="sparktech-mail-review",
            allowed_reviewer_subjects=frozenset({"reviewer-123"}),attempt_store=store)
        second.approval_request(now=NOW); challenge=second._challenge
        claims=VerifiedHumanDecision("https://idp.example.invalid","sparktech-mail-review","reviewer-123",
            True,challenge.challenge_hash,NOW,NOW+timedelta(minutes=2),"assertion-1")
        second.verifier=TestOnlyVerifier(claims)
        with self.assertRaisesRegex(CanaryBlocked,"replay"):
            second.accept_assertion(b"fixture-valid-assertion",now=NOW)

    def test_wrong_issuer_audience_reviewer_or_challenge_fails(self):
        for kwargs in ({"issuer":"wrong"},{"audience":"wrong"},{"subject":"unapproved"},
                       {"challenge_hash_override":"0"*64}):
            with self.subTest(kwargs=kwargs):
                message=envelope(); store=TestOnlyAttemptStore()
                p=OneMessageCanary(message,tenant_id="test-tenant",expected_issuer="https://idp.example.invalid",
                    expected_audience="sparktech-mail-review",allowed_reviewer_subjects=frozenset({"reviewer-123"}),attempt_store=store)
                p.approval_request(now=NOW); ch=p._challenge
                claims=dict(issuer="https://idp.example.invalid",audience="sparktech-mail-review",subject="reviewer-123")
                claims.update(kwargs)
                d=VerifiedHumanDecision(claims["issuer"],claims["audience"],claims["subject"],True,
                    kwargs.get("challenge_hash_override",ch.challenge_hash),NOW,NOW+timedelta(minutes=2),"assertion-1")
                p.verifier=TestOnlyVerifier(d)
                with self.assertRaises(CanaryBlocked): p.accept_assertion(b"fixture-valid-assertion",now=NOW)

    def test_challenge_expiry_and_policy_expiry_block(self):
        p=OneMessageCanary(envelope(),tenant_id="test-tenant",expected_issuer="i",expected_audience="a",
            allowed_reviewer_subjects=frozenset({"reviewer-123"}),verifier=TestOnlyVerifier(None))
        p.approval_request(ttl_seconds=60,now=NOW)
        with self.assertRaisesRegex(CanaryBlocked,"expired"):
            p.accept_assertion(b"fixture-valid-assertion",now=NOW+timedelta(seconds=60))
        p,*_=prepared()
        p.live_enabled=True
        with self.assertRaisesRegex(CanaryBlocked,"expired"):
            p.send_once(p.graph_adapter(TestOnlyTokenProvider(),transport=TestOnlyTransport(),live_enabled=True),now=NOW+timedelta(minutes=6))

    def test_token_principal_tenant_and_scope_must_match(self):
        p,*_=prepared()
        for token in (TestOnlyTokenProvider(principal="other@example.invalid"),
                      TestOnlyTokenProvider(tenant="other-tenant"),
                      TestOnlyTokenProvider(scopes=())):
            with self.subTest(token=token.principal,tenant=token.tenant_id):
                with self.assertRaises(CanaryBlocked): p.graph_adapter(token,transport=TestOnlyTransport(),live_enabled=True)

    def test_altered_adapter_policy_or_message_is_denied(self):
        p,_,_,_,transport,adapter,_=prepared()
        p.live_enabled=True
        adapter.policy=replace(adapter.policy,allowed_recipients=frozenset({"elsewhere@example.invalid"}))
        with self.assertRaisesRegex(CanaryBlocked,"policy"):
            p.send_once(adapter,now=NOW)
        self.assertEqual(transport.calls,[])

        p,_,_,_,transport,adapter,_=prepared()
        object.__setattr__(p.message,"text_body","altered after approval")
        p.live_enabled=True
        with self.assertRaisesRegex(CanaryBlocked,"content changed"):
            p.send_once(adapter,now=NOW)
        self.assertEqual(transport.calls,[])

    def test_success_uses_mock_only_and_duplicate_send_is_blocked(self):
        p,_,_,token,transport,adapter,store=prepared()
        p.live_enabled=True
        result=p.send_once(adapter,now=NOW)
        self.assertEqual(result["status"],"accepted_unconfirmed_delivery")
        self.assertEqual(len(transport.calls),1)
        self.assertEqual(token.calls,[(SCOPE,)])
        self.assertEqual(len(store.sends),1)
        with self.assertRaises(CanaryBlocked): p.send_once(adapter,now=NOW)
        self.assertEqual(len(transport.calls),1)

    def test_ambiguous_acceptance_is_held_and_never_retried(self):
        p,_,_,_,transport,adapter,_=prepared()
        transport.error=TimeoutError("test-only timeout after unknown provider result")
        p.live_enabled=True
        first=p.send_once(adapter,now=NOW)
        self.assertEqual(first["status"],"ambiguous_hold")
        self.assertFalse(first["automatic_retry"])
        with self.assertRaises(CanaryBlocked): p.send_once(adapter,now=NOW)
        self.assertEqual(len(transport.calls),1)

    def test_server_error_is_ambiguous_and_not_retried(self):
        p,_,_,_,transport,adapter,_=prepared()
        transport.status=500
        p.live_enabled=True
        result=p.send_once(adapter,now=NOW)
        self.assertEqual(result["status"],"ambiguous_hold")
        self.assertFalse(result["automatic_retry"])
        with self.assertRaises(CanaryBlocked): p.send_once(adapter,now=NOW)
        self.assertEqual(len(transport.calls),1)

    def test_disable_before_send_revokes_gate_and_does_not_claim_attempt(self):
        p,_,_,_,transport,adapter,store=prepared()
        p.live_enabled=True
        result=p.disable("test-only stop")
        self.assertEqual(result["status"],"disabled")
        self.assertFalse(result["message_recall_available"])
        with self.assertRaises(CanaryBlocked): p.send_once(adapter,now=NOW)
        self.assertEqual(transport.calls,[])
        self.assertEqual(store.sends,{})

    def test_missing_durable_attempt_store_blocks_even_with_other_gates(self):
        p,_,_,_,transport,adapter,_=prepared(store=None)
        p.attempt_store=type("VolatileOnly",(),{"durable":False,"claim_send":lambda *a:True,"record_result":lambda *a:None})()
        p.live_enabled=True
        with self.assertRaisesRegex(CanaryBlocked,"durable atomic"):
            p.send_once(adapter,now=NOW)
        self.assertEqual(transport.calls,[])


if __name__ == "__main__": unittest.main()
