"""Read-only public SEO/AEO audit. It is hard-limited to BallotWatch public GET endpoints."""
import argparse
from datetime import date, datetime, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
import hashlib
import json
from pathlib import Path
import re
import time
from urllib.parse import urljoin, urlsplit
import urllib.error
import urllib.robotparser
import urllib.request
import xml.etree.ElementTree as ET

from .runner import atomic_json

BASE = "https://www.ballotwatch.io"
MAX_BYTES = 1_000_000
MAX_AGE_SECONDS = 86_400
USER_AGENT = "SparkTechPublicSiteAudit/1.0"
ENDPOINTS = {"robots": "/robots.txt", "sitemap": "/sitemap.xml", "homepage": "/"}


def _now(): return datetime.now(timezone.utc)


def _header_date(headers):
    raw = headers.get("Date")
    if not raw: return None
    try:
        stamp = parsedate_to_datetime(raw)
        if stamp.tzinfo is None: stamp = stamp.replace(tzinfo=timezone.utc)
        return stamp.astimezone(timezone.utc)
    except (TypeError, ValueError, OverflowError): return None


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl): return None


def _get(name, timeout=8):
    path = ENDPOINTS[name]
    url = BASE + path
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html, application/xml, text/plain;q=0.9"}, method="GET")
    started = time.monotonic()
    result = {"endpoint": name, "url": url, "requested_at": _now().isoformat(), "method": "GET"}
    try:
        opener = urllib.request.build_opener(_NoRedirect())
        with opener.open(req, timeout=timeout) as response:
            final_url = response.geturl()
            body = response.read(MAX_BYTES + 1)
            status = response.status
            headers = response.headers
    except urllib.error.HTTPError as exc:
        result.update(status=exc.code, failure="http_error", retry_after=exc.headers.get("Retry-After"))
        return result, None
    except (OSError, urllib.error.URLError, TimeoutError) as exc:
        result.update(status=None, failure=type(exc).__name__)
        return result, None
    elapsed = round((time.monotonic() - started) * 1000, 2)
    if len(body) > MAX_BYTES:
        result.update(status=status, failure="response_too_large", bytes_read=len(body), elapsed_ms=elapsed)
        return result, None
    date_header = _header_date(headers)
    age = headers.get("Age")
    try: age_seconds = int(age) if age is not None else 0
    except ValueError: age_seconds = None
    result.update(status=status, final_url=final_url, content_type=headers.get("Content-Type"), bytes=len(body),
                  sha256=hashlib.sha256(body).hexdigest(), server=headers.get("Server"), date_header=date_header.isoformat() if date_header else None,
                  freshness_seconds=max(0, (_now() - date_header).total_seconds()) + age_seconds if date_header and age_seconds is not None else None,
                  elapsed_ms=elapsed)
    media_type = (headers.get("Content-Type") or "").split(";", 1)[0].strip().lower()
    allowed_types = {"robots": {"text/plain"}, "sitemap": {"application/xml", "text/xml"}, "homepage": {"text/html"}}
    if final_url != url: result["failure"] = "unexpected_redirect"
    elif status != 200: result["failure"] = "non_200_status"
    elif media_type not in allowed_types[name]: result["failure"] = "unexpected_content_type"
    elif date_header is None: result["failure"] = "missing_or_invalid_date_header"
    elif result["freshness_seconds"] > MAX_AGE_SECONDS: result["failure"] = "stale_http_representation"
    if result.get("failure"): return result, None
    return result, body


class _Page(HTMLParser):
    def __init__(self, base=BASE):
        super().__init__(convert_charrefs=True)
        self.base = base.rstrip("/")
        self.title = ""; self.in_title = False; self.current_tag = None; self.text_chunks = []
        self.meta = []; self.links = []; self.headings = {"h1": 0, "h2": 0, "h3": 0}
        self.jsonld = []; self._in_jsonld = False; self._jsonld_text = []; self.details = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title": self.in_title = True
        if tag in self.headings: self.headings[tag] += 1
        if tag == "meta": self.meta.append(attrs)
        if tag == "link": self.links.append(attrs)
        if tag == "details": self.details += 1
        if tag == "script" and attrs.get("type", "").lower() == "application/ld+json": self._in_jsonld = True; self._jsonld_text = []

    def handle_endtag(self, tag):
        if tag == "title": self.in_title = False
        if tag == "script" and self._in_jsonld:
            self.jsonld.append("".join(self._jsonld_text)); self._in_jsonld = False

    def handle_data(self, data):
        if self.in_title: self.text_chunks.append(data)
        if self._in_jsonld: self._jsonld_text.append(data)

    def metrics(self):
        meta = {}
        for row in self.meta:
            key = (row.get("name") or row.get("property") or "").lower()
            if key and key not in meta: meta[key] = row.get("content", "")
        title = " ".join(" ".join(self.text_chunks).split())
        canonical = [x.get("href") for x in self.links if "canonical" in (x.get("rel") or "").lower().split()]
        types = []
        faq_count = 0
        for raw in self.jsonld:
            try: block = json.loads(raw)
            except (ValueError, TypeError): continue
            stack = block if isinstance(block, list) else [block]
            for item in stack:
                if not isinstance(item, dict): continue
                graph = item.get("@graph", [])
                stack.extend(x for x in graph if isinstance(x, dict))
                kind = item.get("@type", [])
                types.extend([kind] if isinstance(kind, str) else [x for x in kind if isinstance(x, str)] if isinstance(kind, list) else [])
                if "FAQPage" in ([kind] if isinstance(kind, str) else kind if isinstance(kind, list) else []):
                    faq_count += len(item.get("mainEntity", [])) if isinstance(item.get("mainEntity", []), list) else 0
        title_len = len(title)
        description = meta.get("description", "")
        robots = meta.get("robots", "").lower()
        canonical_target = urljoin(self.base + "/", canonical[0]) if len(canonical) == 1 else None
        canonical_parts = urlsplit(canonical_target) if canonical_target else None
        canonical_self = bool(canonical_parts and canonical_parts.scheme == "https" and canonical_parts.netloc == urlsplit(self.base).netloc and canonical_parts.path == "/" and not canonical_parts.query and not canonical_parts.fragment)
        issues = []
        if not title: issues.append("missing_title")
        elif title_len > 60: issues.append("title_over_60_chars")
        if not description: issues.append("missing_meta_description")
        elif not 50 <= len(description) <= 170: issues.append("meta_description_outside_50_170_chars")
        if self.headings["h1"] != 1: issues.append("h1_count_not_one")
        if len(canonical) != 1: issues.append("canonical_count_not_one")
        elif not canonical_self: issues.append("canonical_not_self")
        if "noindex" in robots: issues.append("noindex_meta_directive")
        aeo = []
        if "FAQPage" not in types and self.details == 0: aeo.append("no_faq_or_details_markup_detected")
        if not any(t in types for t in ("WebSite", "Organization", "WebPage")): aeo.append("limited_entity_schema_detected")
        if not meta.get("og:title"): aeo.append("missing_opengraph_title")
        if not meta.get("og:description"): aeo.append("missing_opengraph_description")
        return {"title_present": bool(title), "title_characters": title_len, "description_present": bool(description),
                "description_characters": len(description), "h1_count": self.headings["h1"], "h2_count": self.headings["h2"],
                "h3_count": self.headings["h3"], "canonical_count": len(canonical), "canonical_is_self": canonical_self, "robots_meta": robots or None,
                "opengraph_title_present": bool(meta.get("og:title")), "opengraph_description_present": bool(meta.get("og:description")),
                "jsonld_blocks": len(self.jsonld), "jsonld_types": sorted(set(types)), "faq_question_count": faq_count,
                "details_elements": self.details, "seo_findings": issues, "aeo_findings": aeo}


def _robots(body, target):
    parser = urllib.robotparser.RobotFileParser()
    parser.set_url(BASE + ENDPOINTS["robots"])
    parser.parse(body.decode("utf-8", errors="strict").splitlines())
    return parser.can_fetch(USER_AGENT, target)


def _sitemap(body):
    root = ET.fromstring(body)
    nodes = list(root)
    lastmods = []
    for node in root.iter():
        if node.tag.endswith("lastmod") and node.text:
            try: lastmods.append(date.fromisoformat(node.text.strip()))
            except ValueError: pass
    latest = max(lastmods) if lastmods else None
    return {"root_type": root.tag.rsplit("}", 1)[-1], "entries": len(nodes),
            "latest_lastmod": latest.isoformat() if latest else None,
            "latest_lastmod_age_days": (_now().date() - latest).days if latest else None,
            "stale": latest is None or (_now().date() - latest).days > 30}


def audit(output, timeout=8):
    # robots is fetched first; page and sitemap are requested only if allowed.
    ledger = []
    robots_record, robots_body = _get("robots", timeout); ledger.append(robots_record)
    report = {"company_id": "ballotwatch", "scope": "public unauthenticated read-only GET; no customer data", "base_url": BASE,
              "captured_at": _now().isoformat(), "status": "blocked", "robots": None, "sitemap": None, "page": None,
              "fetches": ledger, "outbound_actions": 0, "production_mutations": 0}
    if robots_body is None:
        report["blockers"] = ["robots.txt could not be fetched fresh; page fetch skipped"]
        atomic_json(output, report); return report
    try:
        allowed = _robots(robots_body, BASE + "/")
    except (UnicodeError, ValueError) as exc:
        report["blockers"] = ["robots.txt could not be parsed", type(exc).__name__]
        atomic_json(output, report); return report
    report["robots"] = {"fetch_status": robots_record["status"], "homepage_allowed_for_audit_agent": allowed,
                        "sha256": robots_record["sha256"], "declared_sitemaps": re.findall(r"(?im)^\s*Sitemap:\s*(\S+)", robots_body.decode("utf-8"))}
    if not allowed:
        report["blockers"] = ["robots.txt disallows homepage for the audit user agent"]
        atomic_json(output, report); return report
    if BASE + ENDPOINTS["sitemap"] not in report["robots"]["declared_sitemaps"]:
        report["blockers"] = ["robots.txt does not declare the configured public sitemap; no sitemap or homepage request made"]
        atomic_json(output, report); return report
    sitemap_record, sitemap_body = _get("sitemap", timeout); ledger.append(sitemap_record)
    if sitemap_body is not None:
        try: report["sitemap"] = _sitemap(sitemap_body)
        except ET.ParseError: sitemap_record["failure"] = "invalid_xml"
    page_record, page_body = _get("homepage", timeout); ledger.append(page_record)
    if page_body is not None:
        parser = _Page()
        try:
            parser.feed(page_body.decode("utf-8", errors="strict"))
            report["page"] = {"source_url": page_record["final_url"], "sha256": page_record["sha256"],
                              "freshness_seconds": page_record["freshness_seconds"], "metrics": parser.metrics()}
        except (UnicodeError, ValueError): page_record["failure"] = "html_parse_failed"
    failures = [x["endpoint"] + ": " + x["failure"] for x in ledger if x.get("failure")]
    report["status"] = "complete" if report["page"] is not None and report["sitemap"] is not None and not failures else "partial"
    report["blockers"] = failures
    report["limitations"] = ["A snapshot checklist does not prove search rankings, indexing, answer citations, political claim accuracy, or user outcomes.",
                             "Only the public homepage, robots.txt and sitemap index were fetched. No account, API, private path or civic claim was accessed."]
    atomic_json(output, report)
    return report


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", required=True, help="Output JSON evidence path")
    parser.add_argument("--timeout", type=int, choices=range(2, 16), default=8)
    args = parser.parse_args(argv)
    print(json.dumps(audit(args.out, args.timeout), indent=2))


if __name__ == "__main__": main()
