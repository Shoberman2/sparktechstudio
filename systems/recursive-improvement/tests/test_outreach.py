from datetime import datetime, timedelta, timezone
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import patch

from rsei.outreach import OutreachStore, AmbiguousDelivery, bootstrap_demo
from rsei.graph_mail import GraphSendPolicy, MicrosoftGraphMailAdapter


class OutreachTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.db=Path(self.tmp.name)/"outreach.sqlite"
        self.store=OutreachStore(self.db)
        self.store.create_company("tenant-a","Tenant A","sender@a.invalid","UTC",daily_cap=5)
        self.store.add_icp("tenant-a","publisher","Publisher",["publisher"],"keeping guides useful")
        self.store.add_source("tenant-a","source-a","local://reviewed-source","We help publishing teams.","owner")
        self.store.add_prospect("tenant-a","prospect-a","alex@example.invalid","Alex Example","publisher",["publisher"])
        self.store.add_campaign("tenant-a","campaign-a","Research intro","publisher","source-a","research_intro",3,"00:00","23:59",[
            {"delay_seconds":0,"subject":"Hi {first_name}: {problem}","body":"{source_fact}; problem: {problem}"},
            {"delay_seconds":3600,"subject":"Follow-up for {first_name}","body":"Following up on our earlier note."}])
        self.store.create_drafts("tenant-a","campaign-a","prospect-a")

    def tearDown(self): self.tmp.cleanup()

    def approve(self,prospect="prospect-a",campaign="campaign-a"):
        self.store.approve_campaign("tenant-a",campaign,"reviewer",ttl_seconds=30*86400)
        self.store.approve_draft("tenant-a",campaign,prospect,1,"reviewer",ttl_seconds=86400)
        self.store.approve_draft("tenant-a",campaign,prospect,2,"reviewer",ttl_seconds=86400)

    def test_retry_duplicate_schedule_and_persisted_job_are_idempotent(self):
        self.approve()
        first=self.store.schedule("tenant-a","campaign-a","prospect-a")
        second=self.store.schedule("tenant-a","campaign-a","prospect-a")
        self.assertEqual(first,second)
        reopened=OutreachStore(self.db)
        job=reopened.claim_job("tenant-a")
        self.assertEqual(job["job_id"],first)
        self.assertIsNone(reopened.claim_job("tenant-a"))

    def test_concurrent_claim_has_single_winner(self):
        self.approve(); self.store.schedule("tenant-a","campaign-a","prospect-a")
        barrier=threading.Barrier(2); results=[]
        def claim(worker):
            local=OutreachStore(self.db); barrier.wait()
            results.append(local.claim_job("tenant-a",worker))
        threads=[threading.Thread(target=claim,args=(f"worker-{i}",)) for i in range(2)]
        [t.start() for t in threads]; [t.join(5) for t in threads]
        self.assertTrue(all(not t.is_alive() for t in threads))
        self.assertEqual(sum(x is not None for x in results),1)

    def test_edit_after_approval_invalidates_exact_draft_approval(self):
        self.approve()
        self.store.edit_draft("tenant-a","campaign-a","prospect-a",1,"Changed subject","Changed body")
        with self.assertRaises(PermissionError): self.store.schedule("tenant-a","campaign-a","prospect-a")

    def test_sender_or_campaign_policy_change_invalidates_campaign_approval(self):
        self.approve()
        with self.store.connect() as db: db.execute("UPDATE companies SET sender='changed@a.invalid' WHERE company_id='tenant-a'")
        with self.assertRaises(PermissionError): self.store.schedule("tenant-a","campaign-a","prospect-a")

    def test_wrong_tenant_is_rejected_for_all_reads_and_sends(self):
        with self.assertRaisesRegex(ValueError,"tenant boundary"):
            self.store.report("tenant-b")
        with self.assertRaisesRegex(ValueError,"Unknown campaign or prospect"):
            self.store.schedule("tenant-a","campaign-a","other-tenant-person")
        self.store.create_company("tenant-b","Tenant B","sender@b.invalid",daily_cap=5)
        with self.assertRaisesRegex(ValueError,"Unknown campaign or prospect"):
            self.store.create_drafts("tenant-b","campaign-a","prospect-a")

    def test_reply_stops_all_future_sequence_steps(self):
        self.approve(); self.store.schedule("tenant-a","campaign-a","prospect-a")
        now=datetime.now(timezone.utc)
        self.assertEqual(self.store.process_one("tenant-a",now=now)["status"],"sent_mock")
        self.assertEqual(self.store.ingest_event("tenant-a","reply-1","alex@example.invalid","reply",now),"processed")
        self.assertEqual(self.store.ingest_event("tenant-a","reply-1","alex@example.invalid","reply",now),"duplicate_ignored")
        self.assertEqual(self.store.process_one("tenant-a",now=now+timedelta(hours=2))["status"],"idle_or_deferred")
        with self.store.connect() as db:
            self.assertEqual(db.execute("SELECT status FROM jobs WHERE step_no=2").fetchone()[0],"stopped")

    def test_bounce_and_unsubscribe_suppress_and_cancel_queued_jobs(self):
        for kind,event in (("bounce","bounced"),("unsubscribe","unsubscribed")):
            self.setUp_tenant_variant(kind)
            self.approve(prospect="prospect-"+kind)
            self.store.schedule("tenant-a","campaign-a","prospect-"+kind)
            self.store.ingest_event("tenant-a",event,f"{kind}@example.invalid",kind)
            with self.store.connect() as db:
                self.assertEqual(db.execute("SELECT status FROM jobs WHERE prospect_id=?",("prospect-"+kind,)).fetchone()[0],"stopped")
            with self.assertRaisesRegex(ValueError,"Suppressed"):
                self.store.add_prospect("tenant-a","retry-"+kind,f"{kind}@example.invalid","Retry","publisher",["publisher"])

    def setUp_tenant_variant(self,suffix):
        email=f"{suffix}@example.invalid"; prospect=f"prospect-{suffix}"
        self.store.add_prospect("tenant-a",prospect,email,suffix,"publisher",["publisher"])
        self.store.create_drafts("tenant-a","campaign-a",prospect)

    def test_sender_window_is_start_inclusive_and_end_exclusive(self):
        # Replace campaign with an explicit daylight-independent UTC window.
        self.store.add_campaign("tenant-a","window-campaign","Window test","publisher","source-a","research_intro",3,"09:00","17:00",[
            {"delay_seconds":0,"subject":"Hi {first_name}","body":"{source_fact}"}])
        self.store.create_drafts("tenant-a","window-campaign","prospect-a")
        self.store.approve_campaign("tenant-a","window-campaign","reviewer",ttl_seconds=30*86400)
        self.store.approve_draft("tenant-a","window-campaign","prospect-a",1,"reviewer",ttl_seconds=86400)
        self.store.schedule("tenant-a","window-campaign","prospect-a",datetime(2026,10,8,8,tzinfo=timezone.utc))
        before=datetime(2026,10,8,8,59,tzinfo=timezone.utc)
        self.assertEqual(self.store.process_one("tenant-a",now=before)["status"],"idle_or_deferred")
        with self.store.connect() as db:
            due=datetime.fromisoformat(db.execute("SELECT due_at FROM jobs WHERE campaign_id='window-campaign'").fetchone()[0])
        self.assertEqual(due,datetime(2026,10,8,9,tzinfo=timezone.utc))
        camp={"window_start":"09:00","window_end":"17:00"}
        self.assertEqual(self.store._next_window(datetime(2026,10,8,9,tzinfo=timezone.utc),camp,"UTC"),datetime(2026,10,8,9,tzinfo=timezone.utc))
        self.assertEqual(self.store._next_window(datetime(2026,10,8,17,tzinfo=timezone.utc),camp,"UTC"),datetime(2026,10,9,9,tzinfo=timezone.utc))

    def test_company_daily_cap_defers_to_next_day(self):
        # Lower the declared company cap for this bounded fixture.
        with self.store.connect() as db: db.execute("UPDATE companies SET max_daily_cap=1 WHERE company_id='tenant-a'")
        self.setUp_tenant_variant("second")
        # Keep approvals, job due times, and worker observations on one fixture
        # clock so the test does not depend on the wall-clock hour it is run.
        now=datetime.now(timezone.utc).replace(hour=12,minute=0,second=0,microsecond=0)
        with patch("rsei.outreach._now",return_value=now):
            self.approve(); self.approve(prospect="prospect-second")
            self.store.schedule("tenant-a","campaign-a","prospect-a",now=now)
            self.store.schedule("tenant-a","campaign-a","prospect-second",now=now)
            self.assertEqual(self.store.process_one("tenant-a",now=now)["status"],"sent_mock")
            self.assertEqual(self.store.process_one("tenant-a",now=now+timedelta(minutes=1))["status"],"idle_or_deferred")
        with self.store.connect() as db:
            due=datetime.fromisoformat(db.execute("SELECT due_at FROM jobs WHERE prospect_id='prospect-second'").fetchone()[0])
        self.assertGreaterEqual(due,datetime(2026,10,9,0,tzinfo=timezone.utc))

    def test_timeout_after_provider_acceptance_reconciles_without_duplicate(self):
        self.approve(); self.store.schedule("tenant-a","campaign-a","prospect-a")
        self.store.provider.timeout_after_persist=True
        now=datetime.now(timezone.utc)
        response=self.store.process_one("tenant-a",now=now)
        self.assertEqual(response["status"],"ambiguous")
        self.assertEqual(self.store.reconcile("tenant-a",response["job_id"]),"sent_reconciled")
        with self.store.connect() as db:
            self.assertEqual(db.execute("SELECT COUNT(*) FROM outbox").fetchone()[0],1)
            self.assertEqual(db.execute("SELECT COUNT(*) FROM jobs WHERE step_no=2").fetchone()[0],1)

    def test_timeout_before_acceptance_requeues_same_idempotency_key(self):
        self.approve(); self.store.schedule("tenant-a","campaign-a","prospect-a")
        self.store.provider.timeout_before_persist=True
        now=datetime.now(timezone.utc)
        response=self.store.process_one("tenant-a",now=now)
        self.assertEqual(response["status"],"ambiguous")
        self.assertEqual(self.store.reconcile("tenant-a",response["job_id"]),"retry_queued")
        self.assertEqual(self.store.process_one("tenant-a",now=now+timedelta(minutes=1))["status"],"sent_mock")
        with self.store.connect() as db: self.assertEqual(db.execute("SELECT COUNT(*) FROM outbox").fetchone()[0],1)

    def test_expired_worker_lease_can_be_reclaimed_with_same_key(self):
        self.approve(); self.store.schedule("tenant-a","campaign-a","prospect-a")
        now=datetime.now(timezone.utc)
        first=self.store.claim_job("tenant-a","crashed-worker",now,lease_seconds=30)
        second=self.store.claim_job("tenant-a","recovery-worker",now+timedelta(seconds=31))
        self.assertEqual(first["job_id"],second["job_id"])
        self.assertEqual(first["idempotency_key"],second["idempotency_key"])
        self.assertEqual(second["attempts"],2)

    def test_bounce_event_stops_future_deliveries_and_live_is_hard_disabled(self):
        self.assertFalse(self.store.status_live("tenant-a")["send_live"])
        self.assertTrue(self.store.status_live("tenant-a")["blockers"])
        self.assertEqual(self.store.ingest_event("tenant-a","bounce-a","alex@example.invalid","bounce"),"processed")
        with self.assertRaisesRegex(ValueError,"stopped or suppressed"):
            self.store.create_drafts("tenant-a","campaign-a","prospect-a")

    def test_demo_bootstrap_uses_only_reserved_synthetic_address(self):
        path=Path(self.tmp.name)/"demo.sqlite"; demo=OutreachStore(path)
        result=bootstrap_demo(demo)
        self.assertEqual(result["prospect_email"],"alex@example.invalid")
        self.assertEqual(demo.status_live("sparktech-demo")["status"],"disabled")

    def test_company_brand_renders_html_and_plaintext_in_review_queue(self):
        with self.store.connect() as db:
            db.execute("UPDATE companies SET brand_id='utern-bluebird' WHERE company_id='tenant-a'")
        drafts=self.store.create_drafts("tenant-a","campaign-a","prospect-a")
        self.assertEqual(drafts[0]["brand_id"],"utern-bluebird")
        self.assertEqual(drafts[0]["sender_name"],"UTern")
        self.assertIn("<!doctype html>",drafts[0]["body_html"])
        self.assertIn("UTern",drafts[0]["body_text"])
        self.assertIn("bluebird",drafts[0]["body_html"].lower())

    def test_live_adapter_cannot_be_used_by_hard_disabled_company_database(self):
        self.approve(); self.store.schedule("tenant-a","campaign-a","prospect-a")
        class Credentials:
            def get_access_token(self,scopes): raise AssertionError("blocked before credential access")
        class Transport:
            def post(self,*args,**kwargs): raise AssertionError("blocked before network")
        policy=GraphSendPolicy("tenant-a","sender@a.invalid",frozenset({"alex@example.invalid"}),frozenset({"research_intro"}),5,
            datetime.now(timezone.utc)+timedelta(hours=1),approved=True)
        self.store.provider=MicrosoftGraphMailAdapter(policy,Credentials(),Transport(),live_enabled=True)
        result=self.store.process_one("tenant-a")
        self.assertEqual(result["status"],"live_disabled")
        with self.store.connect() as db:
            self.assertEqual(db.execute("SELECT status FROM jobs WHERE company_id='tenant-a'").fetchone()[0],"stopped")

    def test_graph_ambiguous_reconciliation_never_requeues_when_not_found(self):
        self.approve(); job_id=self.store.schedule("tenant-a","campaign-a","prospect-a")
        with self.store.connect() as db:
            db.execute("UPDATE jobs SET status='ambiguous',provider_name='microsoft-graph' WHERE job_id=?",(job_id,))
        policy=GraphSendPolicy("tenant-a","sender@a.invalid",frozenset({"alex@example.invalid"}),frozenset({"research_intro"}),5,
            datetime.now(timezone.utc)+timedelta(hours=1),approved=True)
        self.store.provider=MicrosoftGraphMailAdapter(policy,object(),object(),live_enabled=True,sent_lookup=lambda company,key:None)
        self.assertEqual(self.store.reconcile("tenant-a",job_id),"manual_review_required")
        with self.store.connect() as db:
            self.assertEqual(db.execute("SELECT status FROM jobs WHERE job_id=?",(job_id,)).fetchone()[0],"ambiguous")
        with self.assertRaises(PermissionError):
            self.store.approve_ambiguous_retry("tenant-a",job_id,"reviewer","local://sent-items-check",False)
        approved=self.store.approve_ambiguous_retry("tenant-a",job_id,"reviewer","local://sent-items-check",True)
        self.assertEqual(approved["status"],"retry_queued_by_human")
        with self.store.connect() as db:
            row=db.execute("SELECT status,idempotency_key FROM jobs WHERE job_id=?",(job_id,)).fetchone()
            self.assertEqual(row["status"],"queued")
            self.assertEqual(row["idempotency_key"],approved["idempotency_key"])


if __name__=="__main__":unittest.main()
