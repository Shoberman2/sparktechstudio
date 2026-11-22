"""One-shot, metadata-only snapshots of two explicitly approved public endpoints.

This is not a company-system connection or political fact checker. LEED is
limited to its public homepage; BallotWatch is limited to its documented,
key-free aggregate stats GET endpoint. No arbitrary URL/path input is accepted.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import hashlib
import json
from pathlib import Path
import time
from urllib.parse import urlsplit
import urllib.error
import urllib.request

from .public_site_audit import MAX_AGE_SECONDS, MAX_BYTES, USER_AGENT, _NoRedirect, _Page
from .runner import atomic_json

TARGETS = {
    "leed": {
        "company_id": "leed",
        "kind": "homepage_metadata",
        "url": "https://www.leed.media/",
        "content_types": {"text/html"},
        "base_url": "https://www.leed.media",
        "scope": "one public homepage GET; metadata and hash only; no private tip intake or crawl",
    },
    "ballotwatch": {
        "company_id": "ballotwatch",
        "kind": "public_api_stats",
        "url": "https://www.ballotwatch.io/api/v1/stats",
        "content_types": {"application/json"},
        "base_url": "https://www.ballotwatch.io",
        "scope": "one documented key-free aggregate stats GET; schema/freshness/hash only; no civic-claim evaluation",
    },
}


def _now():
    return datetime.now(timezone.utc)


def _freshness(headers, now):
    raw_date = headers.get("Date")
    if not raw_date:
        return None, "missing_or_invalid_date_header"
    try:
        stamp = parsedate_to_datetime(raw_date)
        if stamp.tzinfo is None:
            stamp = stamp.replace(tzinfo=timezone.utc)
        stamp = stamp.astimezone(timezone.utc)
    except (TypeError, ValueError, OverflowError):
        return None, "missing_or_invalid_date_header"
    raw_age = headers.get("Age", "0")
    try:
        age = int(raw_age)
        if age < 0:
            raise ValueError
    except (ValueError, TypeError):
        return None, "invalid_age_header"
    seconds = max(0.0, (now - stamp).total_seconds()) + age
    return seconds, "stale_http_representation" if seconds > MAX_AGE_SECONDS else None


def _get(company_id, timeout=8):
    target = TARGETS[company_id]
    url = target["url"]
    request = urllib.request.Request(url,
        headers={"User-Agent": USER_AGENT, "Accept": ", ".join(sorted(target["content_types"]))},
        method="GET")
    started = time.monotonic()
    requested_at = _now()
    record = {"company_id": company_id, "endpoint": target["kind"], "url": url,
              "method": "GET", "requested_at": requested_at.isoformat()}
    opener = urllib.request.build_opener(_NoRedirect())
    try:
        with opener.open(request, timeout=timeout) as response:
            body = response.read(MAX_BYTES + 1)
            record.update(http_status=response.status, final_url=response.geturl(),
                          content_type=response.headers.get("Content-Type"),
                          age_header=response.headers.get("Age"), date_header=response.headers.get("Date"),
                          elapsed_ms=round((time.monotonic() - started) * 1000, 2))
            if len(body) > MAX_BYTES:
                record.update(status="blocked", failure="response_too_large", bytes_read=len(body))
                return record, None
            record.update(bytes=len(body), response_sha256=hashlib.sha256(body).hexdigest())
            media_type = (response.headers.get("Content-Type") or "").split(";", 1)[0].strip().lower()
            freshness, fresh_error = _freshness(response.headers, _now())
            record["freshness_seconds"] = round(freshness, 2) if freshness is not None else None
            if response.geturl() != url:
                fresh_error = fresh_error or "unexpected_redirect"
            elif response.status != 200:
                fresh_error = fresh_error or "non_200_status"
            elif media_type not in target["content_types"]:
                fresh_error = fresh_error or "unexpected_content_type"
            if fresh_error:
                record.update(status="blocked", failure=fresh_error)
                return record, None
            record["status"] = "fetched"
            return record, body
    except urllib.error.HTTPError as exc:
        record.update(http_status=exc.code, status="blocked", failure="http_error")
        return record, None
    except (OSError, urllib.error.URLError, TimeoutError) as exc:
        record.update(status="blocked", failure=type(exc).__name__)
        return record, None


def _age(value, now):
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        parsed = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            return None
        return max(0.0, (now - parsed.astimezone(timezone.utc)).total_seconds())
    except (ValueError, OverflowError):
        return None


def snapshot(company_id, output, timeout=8):
    if company_id not in TARGETS:
        raise ValueError("only the explicit LEED or BallotWatch public target is supported")
    if type(timeout) is not int or not 2 <= timeout <= 15:
        raise ValueError("timeout must be 2..15 seconds")
    record, body = _get(company_id, timeout)
    target = TARGETS[company_id]
    report = {"company_id": company_id, "mode": "public_read_only", "scope": target["scope"],
              "captured_at": _now().isoformat(), "status": "blocked", "fetch": record,
              "outbound_actions": 0, "production_mutations": 0, "response_body_persisted": False,
              "limitations": []}
    if body is None:
        report["limitations"].append("No fresh response body was parsed or retained.")
    elif company_id == "leed":
        page = _Page(base=target["base_url"])
        try:
            page.feed(body.decode("utf-8", errors="strict"))
            report["page"] = page.metrics()
            report["status"] = "complete"
        except (UnicodeError, ValueError):
            report["status"] = "partial"
            record.update(status="partial", failure="html_parse_failed")
    else:
        try:
            data = json.loads(body.decode("utf-8", errors="strict"))
            if not isinstance(data, dict) or not isinstance(data.get("meta"), dict) or not isinstance(data.get("data"), dict):
                raise ValueError("expected top-level meta/data objects")
            updated_at = data["meta"].get("data_updated_at")
            data_age = _age(updated_at, _now())
            report["api"] = {"top_level_keys": sorted(data),
                             "meta_keys": sorted(data["meta"]),
                             "data_keys": sorted(data["data"]),
                             "api_version": data["meta"].get("api_version"),
                             "data_updated_at": updated_at,
                             "data_age_seconds": round(data_age, 2) if data_age is not None else None,
                             "data_is_fresh_24h": data_age is not None and data_age <= MAX_AGE_SECONDS}
            if data_age is not None and data_age <= MAX_AGE_SECONDS:
                report["status"] = "complete"
            else:
                report["status"] = "partial"
                report["limitations"].append("API data_updated_at is missing, malformed, or older than 24 hours.")
        except (UnicodeError, ValueError, TypeError):
            report["status"] = "partial"
            record.update(status="partial", failure="invalid_json_schema")
            report["limitations"].append("Public API response did not match the documented aggregate envelope.")
    report["limitations"].append("This snapshot checks endpoint availability, response freshness and metadata only; it does not validate company claims against primary sources or prove the company application works.")
    output = Path(output).expanduser().resolve()
    if output.exists():
        raise FileExistsError(f"refusing to overwrite existing evidence file: {output}")
    output.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    atomic_json(output, report)
    output.chmod(0o600)
    return report


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--company", choices=sorted(TARGETS), required=True)
    parser.add_argument("--out", required=True, help="new local JSON evidence path; existing files are never overwritten")
    parser.add_argument("--timeout", type=int, choices=range(2, 16), default=8)
    args = parser.parse_args(argv)
    print(json.dumps(snapshot(args.company, args.out, args.timeout), indent=2))


if __name__ == "__main__":
    main()
