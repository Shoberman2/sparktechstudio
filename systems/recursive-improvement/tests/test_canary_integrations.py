import os
import http.client
import json
import sys
import tempfile
import types
import unittest
from unittest.mock import patch
from datetime import datetime, timedelta, timezone
from urllib.parse import urlsplit

from rsei.canary_review import ReviewCard, ReviewControls, open_review_window
from rsei.canary_review_web import LoopbackReviewServer
from rsei.email_pilot import (ApprovalChallenge, CanaryBlocked, ExactMessage,
    OneMessageCanary, VerifiedHumanDecision)
from rsei.entra_review import EntraConfigurationRequired, MSALEntraReviewer
from rsei.sqlite_canary_store import SQLiteCanaryStore

NOW = datetime.now(timezone.utc)

class FakeMsal:
    def __init__(self, client, tenant): self.client, self.tenant = client, tenant
    def acquire_token_interactive(self, scopes):
        assert scopes == ["openid"]
        return {"id_token": "synthetic-id-token", "id_token_claims": {
            "aud": self.client, "tid": self.tenant,
            "iss": f"https://login.microsoftonline.com/{self.tenant}/v2.0",
            "sub": "reviewer-subject", "iat": int(NOW.timestamp()),
            "exp": int((NOW + timedelta(minutes=8)).timestamp())}}

class CanaryIntegrationTests(unittest.TestCase):
    def challenge(self):
        return ApprovalChallenge("id", "challenge-hash", "message-hash", "scope-hash",
                                 NOW+timedelta(minutes=5), {})

    def test_entra_requires_configuration_and_authenticates_with_openid_only(self):
        with self.assertRaises(EntraConfigurationRequired):
            MSALEntraReviewer(None,None).authenticate_decision(self.challenge(),True,now=NOW)
        reviewer=MSALEntraReviewer("tenant","client",frozenset({"reviewer-subject"}),
                                   app_factory=lambda c,t: FakeMsal(c,t))
        proof=reviewer.authenticate_decision(self.challenge(),True,now=NOW)
        self.assertEqual(proof.subject,"reviewer-subject")
        self.assertTrue(proof.approved)
        self.assertNotEqual(proof.assertion_id,"synthetic-id-token")

    def test_entra_rejects_wrong_tenant_audience_and_unlisted_subject(self):
        class Bad(FakeMsal):
            def acquire_token_interactive(self, scopes):
                result=super().acquire_token_interactive(scopes)
                result["id_token_claims"]["tid"]="another"
                return result
        reviewer=MSALEntraReviewer("tenant","client",frozenset({"reviewer-subject"}),app_factory=lambda c,t: Bad(c,t))
        with self.assertRaisesRegex(CanaryBlocked,"tenant mismatch"):
            reviewer.authenticate_decision(self.challenge(),True,now=NOW)
        reviewer=MSALEntraReviewer("tenant","client",frozenset({"someone-else"}),app_factory=lambda c,t: FakeMsal(c,t))
        with self.assertRaisesRegex(CanaryBlocked,"not authorized"):
            reviewer.authenticate_decision(self.challenge(),False,now=NOW)

    def test_sqlite_unique_claims_survive_reopen_and_file_is_private(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=os.path.join(tmp,"attempts.sqlite")
            db=SQLiteCanaryStore(path)
            self.assertTrue(db.claim_approval("proof","challenge"))
            self.assertFalse(SQLiteCanaryStore(path).claim_approval("proof","challenge"))
            self.assertTrue(db.set_approval_decision("proof","challenge","approved","reviewer"))
            self.assertTrue(db.claim_send("policy","message"))
            self.assertFalse(SQLiteCanaryStore(path).claim_send("policy","message"))
            db.record_result("policy","accepted_unconfirmed_delivery","fixture")
            self.assertEqual(SQLiteCanaryStore(path).status("policy")["status"],"accepted_unconfirmed_delivery")
            self.assertEqual(os.stat(path).st_mode & 0o777,0o600)

    def test_review_card_shows_exact_one_message_and_never_enables_send(self):
        request={"sender":"from@example.invalid","recipient":"to@example.invalid","category":"test",
          "subject":"Subject","text_body":"Exact body","message_hash":"a"*64,
          "approval_expires_at":NOW.isoformat(),"max_messages":1,"html_body":None}
        card=ReviewCard.from_request(request)
        self.assertEqual(card.text_body,"Exact body")
        self.assertEqual(card.recipient,"to@example.invalid")
        self.assertFalse(ReviewControls(True,True).can_send)
        self.assertFalse(ReviewControls(True,False).can_decide)
        request["max_messages"]=2
        with self.assertRaises(ValueError): ReviewCard.from_request(request)

    def test_authenticated_decision_is_bound_to_open_exact_challenge(self):
        with tempfile.TemporaryDirectory() as tmp:
            store=SQLiteCanaryStore(os.path.join(tmp,"review.sqlite"))
            message=ExactMessage("sparktech","sender@example.invalid","recipient@example.invalid",
                                 "canary","Exact subject","Exact body")
            controller=OneMessageCanary(message,tenant_id="tenant",
                expected_issuer="https://login.microsoftonline.com/tenant/v2.0",
                expected_audience="client",allowed_reviewer_subjects=frozenset({"reviewer-subject"}),
                attempt_store=store)
            controller.approval_request(now=NOW)
            identity=MSALEntraReviewer("tenant","client",frozenset({"reviewer-subject"}),
                app_factory=lambda c,t: FakeMsal(c,t))
            decision=identity.authenticate_decision(controller._challenge,True,now=NOW)
            result=controller.accept_authenticated_decision(decision,now=NOW)
            self.assertEqual(result["status"],"approved_not_sent")
            self.assertEqual(controller.state,"approved_not_sent")
            self.assertEqual(store.approval(decision.assertion_id)["decision"],"approved")

    def test_review_window_actions_reopen_and_exact_rendering_with_widget_double(self):
        class Widget:
            all=[]
            def __init__(self,*args,**kwargs):
                self.args=args; self.kwargs=kwargs; self.state=kwargs.get("state","normal")
                self.text=kwargs.get("text",""); self.command=kwargs.get("command"); self.text_content=""
                Widget.all.append(self)
            def pack(self,*args,**kwargs): pass
            def configure(self,**kwargs): self.__dict__.update(kwargs)
            def insert(self,*args): self.text_content += args[-1]
            def invoke(self):
                if self.state != "disabled" and self.command: self.command()
        class Var:
            instances=[]
            def __init__(self,*args,**kwargs): self.value=kwargs.get("value"); Var.instances.append(self)
            def get(self): return self.value
            def set(self,value): self.value=value
        class Root(Widget):
            roots=[]
            def __init__(self): super().__init__(); Root.roots.append(self)
            def title(self,*args): pass
            def geometry(self,*args): pass
            def resizable(self,*args): pass
            def mainloop(self): pass
            def destroy(self): self.destroyed=True
        tk=types.ModuleType("tkinter")
        tk.Tk=Root; tk.Label=Widget; tk.Text=Widget; tk.Checkbutton=Widget; tk.Frame=Widget
        tk.Button=Widget; tk.BooleanVar=Var; tk.StringVar=Var
        errors=types.ModuleType("tkinter.messagebox")
        errors.showerror=lambda *args,**kwargs: None
        tk.messagebox=errors
        with tempfile.TemporaryDirectory() as tmp:
            store=SQLiteCanaryStore(os.path.join(tmp,"ui.sqlite"))
            message=ExactMessage("sparktech","sender@example.invalid","recipient@example.invalid",
                                 "canary","Exact subject","Fixture text body")
            controller=OneMessageCanary(message,tenant_id="tenant",
                expected_issuer="https://login.microsoftonline.com/tenant/v2.0",
                expected_audience="client",allowed_reviewer_subjects=frozenset({"reviewer-subject"}),
                attempt_store=store)
            request=controller.approval_request(now=NOW)
            auth=MSALEntraReviewer("tenant","client",frozenset({"reviewer-subject"}),
                                   app_factory=lambda c,t: FakeMsal(c,t))
            with patch.dict(sys.modules,{"tkinter":tk,"tkinter.messagebox":errors}):
                open_review_window(request,auth,controller)
                labels=[w.text for w in Widget.all if isinstance(w,Widget)]
                self.assertTrue(any("sender@example.invalid" in t for t in labels))
                self.assertTrue(any("recipient@example.invalid" in t for t in labels))
                self.assertTrue(any("Category: canary" in t for t in labels))
                self.assertTrue(any("Subject: Exact subject" in t for t in labels))
                self.assertTrue(any(request["message_hash"] in t for t in labels))
                self.assertTrue(any(request["approval_expires_at"] in t for t in labels))
                self.assertIn("Fixture text body",[w.text_content for w in Widget.all])
                approve=next(w for w in Widget.all if w.text=="Approve exact message")
                deny=next(w for w in Widget.all if w.text=="Deny")
                cancel=next(w for w in Widget.all if w.text=="Cancel")
                approve.invoke() # missing acknowledgement: no authentication/decision
                self.assertEqual(controller.state,"awaiting_human_approval")
                self.assertEqual(store.approval("unused"),None)
                next(w for w in Widget.all if w.kwargs.get("text","").startswith("I reviewed this exact")).kwargs["variable"].set(True)
                approve.invoke()
                self.assertEqual(controller.state,"approved_not_sent")
                self.assertEqual(len([w for w in Widget.all if w.text=="Approve exact message"]),1)
                self.assertEqual(approve.state,"disabled")
                self.assertEqual(deny.state,"disabled")
                approve.invoke() # repeated click is disabled by the widget
                deny.invoke() # cannot reverse an already recorded approval
                self.assertEqual(controller.state,"approved_not_sent")
                self.assertEqual(store.status(controller.policy.policy_id),None) # approval alone never creates a send
                open_review_window(request,auth,controller) # reopened terminal challenge remains non-actionable
                latest=[w for w in Widget.all if w.text=="Approve exact message"][-1]
                self.assertEqual(latest.state,"disabled")
                [w for w in Widget.all if w.text=="Cancel"][-1].invoke()
                self.assertTrue(Root.roots[-1].destroyed)
                self.assertEqual(store.approval(controller.policy.assertion_id)["decision"],"approved")
                self.assertEqual(len(store.approval_for_challenge(controller._challenge.challenge_hash)),1)

                # A fresh request can be cancelled/dismissed and reopened without recording a decision.
                second=OneMessageCanary(message,tenant_id="tenant",
                    expected_issuer="https://login.microsoftonline.com/tenant/v2.0",
                    expected_audience="client",allowed_reviewer_subjects=frozenset({"reviewer-subject"}),
                    attempt_store=store)
                second_request=second.approval_request(now=NOW)
                open_review_window(second_request,auth,second)
                [w for w in Widget.all if w.text=="Cancel"][-1].invoke()
                self.assertEqual(second.state,"awaiting_human_approval")
                self.assertEqual(store.approval_for_challenge(second._challenge.challenge_hash),[])
                open_review_window(second_request,auth,second)
                [w for w in Widget.all if w.kwargs.get("text","").startswith("I reviewed this exact")][-1].kwargs["variable"].set(True)
                [w for w in Widget.all if w.text=="Deny"][-1].invoke()
                self.assertEqual(second.state,"denied")
                self.assertEqual(store.approval_for_challenge(second._challenge.challenge_hash),
                                 [{"decision":"denied","reviewer_subject":"reviewer-subject"}])
                self.assertIsNone(store.status("unused-send-policy"))

    def test_loopback_browser_server_csrf_ack_and_duplicate_approval_guards(self):
        with tempfile.TemporaryDirectory() as tmp:
            store=SQLiteCanaryStore(os.path.join(tmp,"browser.sqlite"))
            message=ExactMessage("sparktech","sender@example.invalid","recipient@example.invalid",
                                 "canary","Browser exact subject","Synthetic browser body")
            controller=OneMessageCanary(message,tenant_id="tenant",
                expected_issuer="https://login.microsoftonline.com/tenant/v2.0",
                expected_audience="client",allowed_reviewer_subjects=frozenset({"reviewer-subject"}),
                attempt_store=store)
            request=controller.approval_request(now=NOW)
            auth=MSALEntraReviewer("tenant","client",frozenset({"reviewer-subject"}),
                                   app_factory=lambda c,t: FakeMsal(c,t))
            try:
                server=LoopbackReviewServer(request,auth,controller).start()
            except PermissionError as exc:
                self.skipTest(f"sandbox forbids loopback bind: {exc}")
            try:
                parsed=urlsplit(server.url)
                conn=http.client.HTTPConnection(parsed.hostname,parsed.port,timeout=3)
                conn.request("GET",parsed.path,headers={"Host":f"127.0.0.1:{parsed.port}"})
                opened=conn.getresponse(); self.assertEqual(opened.status,303)
                cookie=opened.getheader("Set-Cookie").split(";",1)[0]
                conn.request("GET","/",headers={"Host":f"127.0.0.1:{parsed.port}","Cookie":cookie})
                page=conn.getresponse(); html=page.read().decode()
                self.assertEqual(page.status,200)
                self.assertIn("Review exact message",html)
                self.assertIn("Approving records a one-message decision only",html)
                conn.request("GET","/api/review",headers={"Host":f"127.0.0.1:{parsed.port}","Cookie":cookie})
                info=conn.getresponse(); payload=json.loads(info.read())
                self.assertEqual(payload["review"]["recipient"],message.recipient)
                self.assertEqual(payload["review"]["message_hash"],message.content_hash)
                self.assertEqual(payload["review"]["text_body"],message.text_body)
                self.assertEqual(payload["review"]["approval_expires_at"],request["approval_expires_at"])
                origin=f"http://127.0.0.1:{parsed.port}"
                body=json.dumps({"decision":"approve","challenge_hash":request["challenge_hash"],"message_hash":message.content_hash})
                headers={"Host":f"127.0.0.1:{parsed.port}","Cookie":cookie,"Origin":origin,
                         "Content-Type":"application/json","X-CSRF-Token":payload["csrf"]}
                forged_headers={**headers,"X-CSRF-Token":"wrong-token"}
                conn.request("POST","/api/decision",body,headers=forged_headers)
                forged=conn.getresponse(); self.assertEqual(forged.status,403); forged.read()
                wrong_origin={**headers,"Origin":"http://attacker.invalid"}
                conn.request("POST","/api/decision",body,headers=wrong_origin)
                origin_block=conn.getresponse(); self.assertEqual(origin_block.status,403); origin_block.read()
                altered=json.dumps({"decision":"approve","challenge_hash":request["challenge_hash"],"message_hash":"0"*64})
                conn.request("POST","/api/decision",altered,headers=headers)
                mismatch=conn.getresponse(); self.assertEqual(mismatch.status,409); mismatch.read()
                conn.request("POST","/api/decision",body,headers=headers)
                blocked=conn.getresponse(); self.assertEqual(blocked.status,428); blocked.read()
                self.assertEqual(controller.state,"awaiting_human_approval")
                ack=json.dumps({"decision":"acknowledge","challenge_hash":request["challenge_hash"],"message_hash":message.content_hash})
                conn.request("POST","/api/decision",ack,headers=headers)
                acknowledged=conn.getresponse(); self.assertEqual(acknowledged.status,200); acknowledged.read()
                conn.request("POST","/api/decision",body,headers=headers)
                approved=conn.getresponse(); result=json.loads(approved.read())
                self.assertEqual(approved.status,200); self.assertEqual(result["status"],"approved_not_sent")
                conn.request("POST","/api/decision",body,headers=headers)
                repeated=conn.getresponse(); self.assertEqual(repeated.status,409); repeated.read()
                conn.request("POST","/api/send",body,headers=headers)
                no_send=conn.getresponse(); self.assertEqual(no_send.status,404); no_send.read()
                self.assertEqual(len(store.approval_for_challenge(request["challenge_hash"])),1)
                self.assertIsNone(store.status(result["policy_id"]))
                conn.close()
            finally:
                server.close()

if __name__ == "__main__": unittest.main()
