import json
from datetime import datetime, timezone
from pathlib import Path
import tempfile
import unittest
from unittest import mock
from rsei.growth_ops import GrowthCycle

FIX = Path(__file__).resolve().parents[1] / "pilot" / "growth-fixture"
# The fixtures were captured on 2026-10-08 and sources go stale after 30 days, so the tests run on a fixed clock the
# day after capture. Without it they pass or fail depending on the calendar (they started failing on 2026-11-07).
FIXTURE_NOW = datetime(2026, 10, 9, tzinfo=timezone.utc)


class GrowthOpsTests(unittest.TestCase):
    def setUp(self):
        clock = mock.patch("rsei.growth_ops._now", return_value=FIXTURE_NOW)
        clock.start()
        self.addCleanup(clock.stop)
        self.tmp = tempfile.TemporaryDirectory()
        self.run = Path(self.tmp.name) / "company-run"
        self.cycle = GrowthCycle.init(FIX / "company.json", FIX, self.run)

    def tearDown(self): self.tmp.cleanup()

    def test_multi_icp_retention_seo_aeo_and_approved_local_fix(self):
        summary = self.cycle.inspect()
        self.assertEqual(summary["icp_matches"], 2)
        self.assertEqual(summary["outreach_drafts"], 2)
        self.assertEqual(summary["retention_cohorts"], 2)
        retention = json.loads((self.run / "retention-audit.json").read_text())
        self.assertEqual(len(retention["experiment_proposals"]), 1)
        proposal = summary["proposal"]
        self.assertFalse(proposal["outbound_send"])
        with self.assertRaises(PermissionError): self.cycle.apply_local(proposal["id"])
        self.cycle.approve(proposal["id"], "local-reviewer")
        self.assertEqual(self.cycle.apply_local(proposal["id"]), "staged_and_checked_locally")
        self.assertEqual(self.cycle.apply_local(proposal["id"]), "already_applied")
        candidate = json.loads((self.run / "candidate-pages.json").read_text())
        self.assertEqual(candidate["pages"][0]["title"], "Example Local Guide | Fixture")
        self.assertEqual(candidate["pages"][0]["faq"][0]["q"], "What is this example?")
        self.assertNotEqual((self.run / "pages.json").read_bytes(), (self.run / "candidate-pages.json").read_bytes())

    def test_tenant_mismatch_and_stale_prospect_do_not_match(self):
        rows = json.loads((self.run / "prospects.json").read_text())
        rows["accounts"][0]["company_id"] = "other-company"
        (self.run / "prospects.json").write_text(json.dumps(rows))
        with self.assertRaisesRegex(ValueError, "different company_id"):
            self.cycle.discover_icps()
        self.cycle = GrowthCycle.init(FIX / "company.json", FIX, Path(self.tmp.name) / "fresh-run")
        rows = json.loads((self.cycle.run / "prospects.json").read_text())
        rows["accounts"][0]["captured_at"] = "2020-01-01T00:00:00+00:00"
        (self.cycle.run / "prospects.json").write_text(json.dumps(rows))
        result = self.cycle.discover_icps()
        self.assertEqual(result["stale_records"], 1)
        self.assertEqual(result["matches"][0]["icp_ids"], [])

    def test_retention_schema_rejects_non_aggregate_or_invalid_counts(self):
        data = json.loads((self.run / "retention.json").read_text())
        data["cohorts"][0]["retained"] = 101
        (self.run / "retention.json").write_text(json.dumps(data))
        result = self.cycle.retention_audit()
        self.assertEqual(len(result["invalid_cohorts"]), 1)
        self.assertEqual(len(result["metrics"]), 1)

    def test_stale_page_is_reported_and_never_auto_proposed(self):
        pages = json.loads((self.run / "pages.json").read_text())
        pages["pages"][0]["captured_at"] = "2020-01-01T00:00:00+00:00"
        (self.run / "pages.json").write_text(json.dumps(pages))
        result = self.cycle.search_audit()
        self.assertIn("stale_or_missing_source", result["audits"][0]["seo_issues"])
        self.assertEqual(result["local_page_edits_proposed"], [])


if __name__ == "__main__": unittest.main()
