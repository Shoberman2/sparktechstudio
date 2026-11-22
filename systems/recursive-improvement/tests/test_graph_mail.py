import unittest

from datetime import datetime, timedelta, timezone
import json
from rsei.graph_mail import (AmbiguousGraphDelivery, GraphSendFailure, GraphSendPolicy,
                             LiveSendingDisabled, MicrosoftGraphMailAdapter)
from rsei.email_themes import THEMES, render_email


class GraphMailAdapterTests(unittest.TestCase):
    def test_prepares_offline_graph_payload(self):
        payload = MicrosoftGraphMailAdapter.prepare(
            {"subject": "Hello", "body": "Reviewed text"}, "person@example.invalid"
        )
        self.assertEqual(MicrosoftGraphMailAdapter.endpoint, "https://graph.microsoft.com/v1.0/me/sendMail")
        self.assertEqual(MicrosoftGraphMailAdapter.required_delegated_scope, "https://graph.microsoft.com/Mail.Send")
        self.assertEqual(payload["message"]["toRecipients"][0]["emailAddress"]["address"], "person@example.invalid")
        self.assertTrue(payload["saveToSentItems"])
        html_payload=MicrosoftGraphMailAdapter.prepare({"subject":"Hello","body":"plain"},"person@example.invalid","<p>html</p>")
        self.assertEqual(html_payload["message"]["body"],{"contentType":"HTML","content":"<p>html</p>"})

    def test_rejects_invalid_recipient_and_empty_draft(self):
        with self.assertRaises(ValueError):
            MicrosoftGraphMailAdapter.prepare({"subject": "x", "body": "y"}, "not-an-email")
        with self.assertRaises(ValueError):
            MicrosoftGraphMailAdapter.prepare({"subject": "", "body": "y"}, "x@example.invalid")

    def test_send_is_hard_disabled_without_network(self):
        with self.assertRaisesRegex(LiveSendingDisabled, "no request was sent"):
            MicrosoftGraphMailAdapter().send({}, {"subject": "x", "body": "y"})

    def test_each_brand_renders_accessible_html_and_plain_text(self):
        for brand, theme in THEMES.items():
            with self.subTest(brand=brand):
                rendered=render_email(brand,"A & B", "Hello <friend>\nSecond line")
                self.assertIn("<!doctype html>",rendered["html"])
                self.assertIn('lang="en"',rendered["html"])
                self.assertIn("A &amp; B",rendered["html"])
                self.assertIn("Hello &lt;friend&gt;<br>",rendered["html"])
                self.assertIn("Hello <friend>\nSecond line",rendered["text"])
                self.assertEqual(theme["sender"],rendered["sender_name"])
        self.assertEqual(THEMES["leed-sherlock"]["sender"],"SparkTech Studio")
        self.assertEqual(THEMES["ballotwatch"]["sender"],"SparkTech Studio")
        self.assertEqual(THEMES["utern-bluebird"]["sender"],"UTern")

    def _live_adapter(self, status=202, error=None):
        class Credentials:
            scopes=None
            principal="spencer@sparktechstudio.com"
            def get_access_token(self, scopes):
                self.scopes=scopes
                return "test-token-never-real"
        class Transport:
            calls=[]
            def post(self,url,headers,body,timeout=20):
                self.calls.append((url,headers,json.loads(body)))
                if error: raise error
                return status,{"request-id":"fixture-id"}
        creds,transport=Credentials(),Transport()
        policy=GraphSendPolicy("sparktech","spencer@sparktechstudio.com",frozenset({"shoberman@icloud.com"}),
            frozenset({"test"}),1,datetime.now(timezone.utc)+timedelta(minutes=10),approved=True)
        adapter=MicrosoftGraphMailAdapter(policy,creds,transport,live_enabled=True)
        job={"company_id":"sparktech","sender":"spencer@sparktechstudio.com","recipient":"shoberman@icloud.com",
             "message_category":"test","company_daily_sent":0,"idempotency_key":"a"*64}
        return adapter,creds,transport,job

    def test_mock_transport_posts_only_after_all_live_gates_and_returns_202_unconfirmed(self):
        adapter,creds,transport,job=self._live_adapter()
        result=adapter.send(job,{"subject":"test","body":"test body"})
        self.assertEqual(result["status"],"accepted_unconfirmed_delivery")
        self.assertEqual(creds.scopes,("https://graph.microsoft.com/Mail.Send",))
        url,headers,payload=transport.calls[0]
        self.assertEqual(url,MicrosoftGraphMailAdapter.endpoint)
        self.assertEqual(headers["Authorization"],"Bearer test-token-never-real")
        self.assertEqual(payload["message"]["toRecipients"][0]["emailAddress"]["address"],job["recipient"])
        self.assertEqual(payload["message"]["internetMessageHeaders"][0]["value"],"a"*64)

    def test_exact_policy_denial_precedes_token_and_network(self):
        adapter,creds,transport,job=self._live_adapter()
        job["recipient"]="another@example.invalid"
        with self.assertRaisesRegex(LiveSendingDisabled,"outside approved audience"):
            adapter.send(job,{"subject":"test","body":"test"})
        self.assertIsNone(creds.scopes)
        self.assertEqual(transport.calls,[])

    def test_provider_rejection_and_ambiguous_timeout_are_not_auto_retried(self):
        adapter,_,transport,job=self._live_adapter(status=429)
        with self.assertRaises(GraphSendFailure) as caught: adapter.send(job,{"subject":"x","body":"y"})
        self.assertEqual(caught.exception.status,429)
        self.assertEqual(len(transport.calls),1)
        adapter,_,transport,job=self._live_adapter(error=TimeoutError("fixture timeout"))
        with self.assertRaises(AmbiguousGraphDelivery): adapter.send(job,{"subject":"x","body":"y"})
        self.assertEqual(len(transport.calls),1)
        self.assertEqual(adapter.reconcile({"status":"ambiguous"},"not-found"),"ambiguous_manual_review_required")

    def test_missing_live_approval_cannot_reach_even_mock_transport(self):
        adapter,creds,transport,job=self._live_adapter()
        adapter.live_enabled=False
        with self.assertRaises(LiveSendingDisabled): adapter.send(job,{"subject":"x","body":"y"})
        self.assertIsNone(creds.scopes)
        self.assertEqual(transport.calls,[])


if __name__ == "__main__":
    unittest.main()
