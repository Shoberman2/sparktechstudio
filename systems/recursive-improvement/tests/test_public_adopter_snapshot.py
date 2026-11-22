import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from rsei import public_adopter_snapshot as mod


NOW = datetime.now(timezone.utc)


def fake_record(company, status="fetched"):
    target = mod.TARGETS[company]
    return {"company_id": company, "endpoint": target["kind"], "url": target["url"],
            "method": "GET", "requested_at": NOW.isoformat(), "http_status": 200,
            "final_url": target["url"], "content_type": "application/json" if company == "ballotwatch" else "text/html",
            "age_header": "0", "date_header": NOW.isoformat(), "freshness_seconds": 0,
            "bytes": 64, "response_sha256": "f"*64, "status": status}


class PublicAdopterSnapshotTests(unittest.TestCase):
    def setUp(self): self.tmp = tempfile.TemporaryDirectory()
    def tearDown(self): self.tmp.cleanup()

    def test_leed_homepage_records_only_metadata_and_hash(self):
        html = b'<html><head><title>Public newsroom home</title><meta name="description" content="Public information only."><link rel="canonical" href="https://www.leed.media/"></head><body><h1>Tip desk</h1></body></html>'
        out = Path(self.tmp.name)/"leed.json"
        with patch.object(mod, "_get", return_value=(fake_record("leed"), html)):
            report = mod.snapshot("leed", out)
        self.assertEqual(report["status"], "complete")
        self.assertEqual(report["page"]["title_characters"], len("Public newsroom home"))
        self.assertTrue(report["page"]["canonical_is_self"])
        self.assertFalse(report["response_body_persisted"])
        self.assertNotIn("Tip desk", out.read_text())
        self.assertEqual(out.stat().st_mode & 0o777, 0o600)

    def test_ballotwatch_api_records_fresh_schema_without_data_values(self):
        body = json.dumps({"meta": {"api_version": "v1", "data_updated_at": NOW.isoformat()},
                           "data": {"type": "stats", "rankings": [{"name": "not retained", "score": 99}]}}).encode()
        out = Path(self.tmp.name)/"ballotwatch.json"
        with patch.object(mod, "_get", return_value=(fake_record("ballotwatch"), body)):
            report = mod.snapshot("ballotwatch", out)
        self.assertEqual(report["status"], "complete")
        self.assertEqual(report["api"]["data_keys"], ["rankings", "type"])
        self.assertTrue(report["api"]["data_is_fresh_24h"])
        self.assertNotIn("not retained", out.read_text())
        self.assertNotIn('"score"', out.read_text())

    def test_stale_http_response_does_not_parse_or_retain_body(self):
        record = fake_record("leed", status="blocked")
        record["failure"] = "stale_http_representation"
        out = Path(self.tmp.name)/"stale.json"
        with patch.object(mod, "_get", return_value=(record, None)):
            report = mod.snapshot("leed", out)
        self.assertEqual(report["status"], "blocked")
        self.assertNotIn("page", report)

    def test_stale_ballotwatch_data_age_is_partial(self):
        old = (NOW - timedelta(days=2)).isoformat()
        body = json.dumps({"meta": {"data_updated_at": old}, "data": {"type": "stats"}}).encode()
        out = Path(self.tmp.name)/"old-data.json"
        with patch.object(mod, "_get", return_value=(fake_record("ballotwatch"), body)):
            report = mod.snapshot("ballotwatch", out)
        self.assertEqual(report["status"], "partial")
        self.assertFalse(report["api"]["data_is_fresh_24h"])

    def test_unknown_company_and_overwrite_are_rejected(self):
        with self.assertRaises(ValueError): mod.snapshot("any-url", Path(self.tmp.name)/"x.json")
        out = Path(self.tmp.name)/"existing.json"
        out.write_text("keep")
        with self.assertRaises(FileExistsError): mod.snapshot("leed", out)
        self.assertEqual(out.read_text(), "keep")


if __name__ == "__main__": unittest.main()
