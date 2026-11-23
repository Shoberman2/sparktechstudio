# BallotWatch source-checking pilot

This is a bounded, synthetic-only pilot for the independent BallotWatch company. It uses the existing SparkTech RSEI runner conventions and records local, company-tagged evidence. Fixtures contain only invented example jurisdictions and events. The checker compares each structured claim's source identifier, field, and value against local fixture records; it does not fetch websites or validate real political information.

The separate `rsei.public_site_audit` command performs a real, unauthenticated public-page SEO/AEO snapshot against the verified `https://www.ballotwatch.io/` host. The repo lists the apex `https://ballotwatch.io`; its direct GET timed out in this execution environment, while the `www` host served the page, `robots.txt`, and sitemap. The adapter requests only those three exact paths, first checks robots permission, rejects redirects, checks HTTP `Date` freshness/content type, caps each response at 1 MB, and stores only aggregate metadata/findings plus body hashes, not raw HTML. No political facts from the page are evaluated. It can run with:

```sh
python3 -m rsei.public_site_audit --out /tmp/ballotwatch-public-audit.json
```

The recorded read-only run is [public homepage audit evidence](evidence/public-homepage-audit-20261008.json). It observed fresh HTTP 200 responses for all three resources and no SEO/AEO checklist findings at that timestamp. This is a snapshot, not a ranking, indexation, citation, or content-accuracy guarantee.

For a bounded source connection check, `rsei.public_adopter_snapshot` supports exactly two public endpoints: the LEED homepage (`https://www.leed.media/`) and BallotWatch's documented key-free aggregate stats endpoint (`https://www.ballotwatch.io/api/v1/stats`). It makes one GET, rejects redirects and stale HTTP representations, limits responses to 1 MB, and writes only hashes and metadata/schema summaries to a new mode-0600 evidence file. It never retains page text or aggregate values. Run from this directory with `PYTHONPATH=.`:

```sh
python3 -m rsei.public_adopter_snapshot --company ballotwatch --out /tmp/ballotwatch-stats.json
python3 -m rsei.public_adopter_snapshot --company leed --out /tmp/leed-homepage.json
```

This is only an anonymous public endpoint probe. It does not connect either company, evaluate civic claims, read LEED submissions, or establish production readiness. In this execution environment on 2026-10-09, both new one-shot requests were blocked by network restrictions (`URLError`); earlier separately observed public requests are historical observations and are not treated as a current successful adapter run. The existing website audit is also currently gated by stale `robots.txt` cache age when reachable.

## Run

From `systems/recursive-improvement`:

```sh
python3 -m rsei.ballotwatch init --run .runs/ballotwatch-demo
python3 -m rsei.ballotwatch baseline --run .runs/ballotwatch-demo
python3 -m rsei.ballotwatch propose --run .runs/ballotwatch-demo
python3 -m rsei.ballotwatch approve --run .runs/ballotwatch-demo --decision approve --reviewer local-reviewer
python3 -m rsei.ballotwatch apply --run .runs/ballotwatch-demo
python3 -m rsei.ballotwatch report --run .runs/ballotwatch-demo
```

Use `--decision deny` to exercise the denied path. `apply --fail-after 1` simulates a partial write and verifies restoration. A second apply after success returns `already_applied`. Use `--fixture clean.json` at init for a zero-defect baseline. Each run directory is single-use; keep it local and inspect `evidence.jsonl`, `baseline.json`, `proposal.json`, `independent-check.json`, and `report.json`.

The pre-change measurement is intentionally modest and reproducible: number of fixture claims checked, number of source/value defects, defect rate per claim, and fixture hash. It is not an accuracy, coverage, or real-world election-information metric. The repair only changes `working.json`; no site, account, external company system, public content, or network endpoint is touched. The approval is a local workflow gate, not identity authentication. The original fixture is retained for rollback.

## Gates before any real pilot

Replace synthetic sources only after BallotWatch approves its public source allowlist, canonical source mapping, jurisdiction coverage, freshness rules, citation format, and false-positive/false-negative acceptance criteria. Then add read-only source adapters with bounded access and public evidence capture. Require BallotWatch owner review of every proposed edit, independent validation against source snapshots, a private staging target, operational access controls, monitoring, and tested rollback before any production integration. Public political content publishing remains out of scope and requires a separate explicit owner decision and approval flow.
