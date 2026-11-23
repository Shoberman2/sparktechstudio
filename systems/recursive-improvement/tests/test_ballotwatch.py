import json
from pathlib import Path
import tempfile
import unittest

from rsei.ballotwatch import BallotWatchPilot


class BallotWatchTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.p = BallotWatchPilot.init(Path(self.tmp.name) / "run")
        self.baseline = self.p.baseline()
        self.proposal = self.p.propose()

    def tearDown(self): self.tmp.cleanup()

    def test_baseline_is_measured_and_repair_requires_human_approval(self):
        self.assertEqual((self.baseline["claims_checked"], self.baseline["defects_found"]), (3, 1))
        with self.assertRaises(PermissionError): self.p.apply()
        self.p.approve("approve", "reviewer-fixture")
        self.assertEqual(self.p.apply(), "verified")
        self.assertEqual(self.p.report()["working_check"]["defects"], [])
        self.assertEqual(self.p.apply(), "already_applied")

    def test_denied_approval_never_changes_fixture(self):
        before = (self.p.run / "working.json").read_bytes()
        self.p.approve("deny")
        with self.assertRaises(PermissionError): self.p.apply()
        self.assertEqual((self.p.run / "working.json").read_bytes(), before)

    def test_partial_apply_rolls_back_and_ledger_records_path(self):
        self.p.approve("approve")
        self.assertEqual(self.p.apply(fail_after=1), "rolled_back_partial")
        self.assertEqual((self.p.run / "working.json").read_bytes(), (self.p.run / "original.json").read_bytes())
        names = [x["event"] for x in self.p._state()["events"]]
        self.assertIn("apply_partial", names); self.assertIn("rollback", names)

    def test_repeat_baseline_and_clean_fixture(self):
        self.assertEqual(self.p.baseline()["fixture_sha256"], self.baseline["fixture_sha256"])
        clean = BallotWatchPilot.init(Path(self.tmp.name) / "clean", "clean.json")
        result = clean.baseline()
        self.assertEqual(result["claims_checked"], 3)
        self.assertEqual(result["defects_found"], 0)
        self.assertEqual(clean.propose()["fixes"], [])

    def test_changed_input_invalidates_proposal(self):
        self.p.approve("approve")
        (self.p.run / "working.json").write_text(json.dumps({"claims": []}))
        with self.assertRaisesRegex(ValueError, "Source changed"):
            self.p.apply()


if __name__ == "__main__": unittest.main()
