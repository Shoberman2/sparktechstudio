from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from rsei import public_site_audit as mod


def record(endpoint, body, failure=None):
    row = {"endpoint": endpoint, "url": mod.BASE + mod.ENDPOINTS[endpoint], "requested_at": "2026-10-08T00:00:00+00:00",
           "method": "GET", "status": 200, "final_url": mod.BASE + mod.ENDPOINTS[endpoint],
           "content_type": "text/plain", "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest(), "date_header": "2026-10-08T00:00:00+00:00", "freshness_seconds": 10}
    if failure: row["failure"] = failure
    return row


class PublicSiteAuditTests(unittest.TestCase):
    def setUp(self): self.tmp = tempfile.TemporaryDirectory(); self.out = Path(self.tmp.name) / "audit.json"
    def tearDown(self): self.tmp.cleanup()

    def fetches(self, blocked=False, partial=False):
        robots = b"User-agent: *\nDisallow: /\n" if blocked else b"User-agent: *\nAllow: /\nSitemap: https://www.ballotwatch.io/sitemap.xml\n"
        sitemap = b"<urlset><url><loc>https://www.ballotwatch.io/</loc><lastmod>2026-10-07</lastmod></url></urlset>"
        page = b'<html><head><title>Fixture title</title><meta name="description" content="A long enough fixture description intended to test parsing and public audit output."><link rel="canonical" href="https://www.ballotwatch.io/"><meta property="og:title" content="Fixture"></head><body><h1>Fixture</h1><script type="application/ld+json">{"@type":"WebSite"}</script></body></html>'
        body_map = {"robots": robots, "sitemap": sitemap, "homepage": page}
        if partial: body_map["sitemap"] = b"not xml"
        return lambda endpoint, timeout=8: (record(endpoint, body_map[endpoint], "http_error" if partial and endpoint == "sitemap" else None), body_map[endpoint] if not (partial and endpoint == "sitemap") else None)

    def test_complete_audit_contains_hashes_and_metadata_only(self):
        with patch.object(mod, "_get", side_effect=self.fetches()): result = mod.audit(self.out)
        self.assertEqual(result["status"], "complete")
        self.assertEqual(result["page"]["metrics"]["h1_count"], 1)
        self.assertIn("missing_opengraph_description", result["page"]["metrics"]["aeo_findings"])
        serialized = self.out.read_text()
        self.assertNotIn("A long enough fixture description", serialized)
        self.assertTrue(all(x["sha256"] for x in result["fetches"]))

    def test_disallowed_page_stops_before_other_gets(self):
        with patch.object(mod, "_get", side_effect=self.fetches(blocked=True)) as get:
            result = mod.audit(self.out)
        self.assertEqual(result["status"], "blocked")
        self.assertEqual(get.call_count, 1)
        self.assertIsNone(result["page"])

    def test_unexpected_sitemap_declaration_stops_additional_fetches(self):
        fn = self.fetches()
        def other_map(endpoint, timeout=8):
            row, body = fn(endpoint, timeout)
            if endpoint == "robots": body = b"User-agent: *\nAllow: /\nSitemap: https://elsewhere.invalid/sitemap.xml\n"
            return row, body
        with patch.object(mod, "_get", side_effect=other_map) as get:
            result = mod.audit(self.out)
        self.assertEqual(result["status"], "blocked")
        self.assertEqual(get.call_count, 1)

    def test_partial_sitemap_is_preserved_as_partial_result(self):
        with patch.object(mod, "_get", side_effect=self.fetches(partial=True)):
            result = mod.audit(self.out)
        self.assertEqual(result["status"], "partial")
        self.assertIsNotNone(result["page"])
        self.assertTrue(any("sitemap" in x for x in result["blockers"]))

    def test_unavailable_stale_or_malformed_robots_blocks_page_fetch(self):
        failed = record("robots", b"", "stale_http_representation")
        with patch.object(mod, "_get", return_value=(failed, None)) as get:
            result = mod.audit(self.out)
        self.assertEqual(result["status"], "blocked")
        self.assertEqual(get.call_count, 1)

    def test_sitemap_age_is_computed(self):
        body = b'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><lastmod>2026-09-30</lastmod></sitemap></sitemapindex>'
        result = mod._sitemap(body)
        self.assertEqual(result["latest_lastmod"], "2026-09-30")
        self.assertIsInstance(result["latest_lastmod_age_days"], int)

    def test_wrong_canonical_host_is_flagged(self):
        parser = mod._Page()
        parser.feed('<html><head><title>x</title><meta name="description" content="ok"><link rel="canonical" href="https://wrong.example/"></head><body><h1>x</h1></body></html>')
        self.assertFalse(parser.metrics()["canonical_is_self"])
        self.assertIn("canonical_not_self", parser.metrics()["seo_findings"])


if __name__ == "__main__": unittest.main()
