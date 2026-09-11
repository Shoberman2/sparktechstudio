# Company learning ledger

A runnable local first slice of Recursive Self-Enterprise Improvement: authorized text → exact evidence → reviewed interpretation → company-specific experiment proposal → human review → observed outcome → explicitly approved general lesson.

This is a trusted-operator CLI and Python library, not a deployed service or autonomous researcher. Python 3.9+ and SQLite from the standard library are sufficient. There are no model calls, subscriptions, background jobs, transcript downloads, employee analytics, or changes to company operations.

## Run

From the repository root:

```sh
python3 -m unittest discover -s systems/knowledge -v
python3 systems/knowledge/demo.py
```

The demo creates a temporary database, processes an authored transcript fixture, records a reviewed experiment and synthetic inconclusive outcome, exports an approved general lesson, then shows a source correction invalidating the earlier claim. The temporary database is removed on exit. It does not claim a real podcast or measured business lift.

## Real authorized input

Save an authorized UTF-8 transcript locally. Create `request.json` with:

```json
{
  "identity": "publisher:episode-identifier-or-source-URL",
  "source_date": "2026-09-10",
  "text_file": "/absolute/path/to/transcript.txt",
  "authorization": "Describe owner permission or authorized source"
}
```

```sh
python3 systems/knowledge/ledger.py --db /private/tmp/company-learning.db --tenant company-a ingest request.json
```

All subsequent commands take a JSON file with the keyword arguments of the corresponding method in `ledger.py`. Example `candidates`: `{"source_id":"RETURNED_UUID"}`. Use `list` with `{}` to inspect the tenant ledger. Each command prints JSON. The source identity and date are supplied by the operator, not independently verified; intake records authorization but cannot establish content rights.

`candidates` extracts exact paragraphs deterministically. It is useful on arbitrary text, but is not semantic AI extraction. A human or separately sandboxed model can prepare `claim` input: `source_id`, zero-based Unicode character `start`/exclusive `end`, `statement`, `technique`, `reviewer`, `review_by` (ISO date). The library validates the span and stores the original quote; semantic fidelity remains a review responsibility. Statements remain speaker claims, not verified facts. No general fact-verification engine is implemented.

`propose` requires `claim_id`, `goal`, `applicability`, `action`, `metric`, `success_rule`, `guardrail`, `rollback`, `duration_days` (1–90), and `budget_usd`. `review` requires `proposal_id`, `reviewer`, `decision` (`approved` or `rejected`), and `rationale`. Latest review controls handoff. Budgets here are proposed bounds; the execution runner must independently enforce them.

`handoff` returns a reviewed request with `execution_authorized: false`. No source or action string is executed. `outcome` records `proposal_id`, `result` (`supported`, `refuted`, `inconclusive`), `evidence_uri`, `observation`, `limitations`, and optional runner `run_id`/`candidate_digest`. Outcome evidence is operator-reported, not fetched or statistically verified. Outcomes can still be recorded after a source becomes stale or approval is revoked so unsuccessful or interrupted work is not lost; current knowledge health is captured alongside them.

## Updates, conflicts, and sharing

Reingesting identical identity/date/content is idempotent. For a correction, pass `supersedes` with the prior source UUID and retain its identity. Old content and claims remain in history, while old claims can no longer be approved or handed off. Different source dates are preserved. Revisions without `supersedes` are separate records: operators must explicitly connect them. Automatic revision discovery is not implemented.

`flag` takes a `claim_id`, `reason`, and optional `conflicting_claim_id`; both sides of a conflict become unusable. There is no silent conflict resolution. Reassess evidence and create a new claim with a fresh review deadline; history remains available. Claims become stale after `review_by`; handoff checks this at use time. There is no scheduler or automatic conflict detector yet.

`share` requires an outcome, separately authored `approved_lesson`, `reviewer`, and `disclosure_approved: true`. `export_lesson` emits only that approved text, an opaque provenance token, and its limited epistemic status. It does not copy private source text, company goals, observations, or company identity. This is human disclosure review, not automated reliable redaction. A recipient can ingest this public JSON/text with its token as source identity and reassess applicability locally. Provenance lookup stays with the originating tenant.

## Shared runner contract

Coordinated with `systems/recursive-improvement` owner in the separate worktree. That runner owns subprocess execution, isolated workspaces, company credentials, budgets, verification, release and recovery. Its current stages are QA-specific; this library deliberately does not insert knowledge ingestion into its repair stages.

The export has `schema_version`, `company_id`, immutable proposal/review records, and `execution_authorized: false`. A future adapter must verify company identity, map the reviewed proposal into permitted runner configuration, recheck current approval/claim health at execution time, and obtain the runner's own execution approval. Store runner `run_id`, `candidate_digest`, and evidence path on the outcome. This handoff is a documented integration boundary, not a wired live adapter. An exported JSON file is not a signed authorization token.

## Security and practical boundaries

Tenant IDs filter every ledger read/reference; they are not authentication. Anyone with database filesystem access can read all tenants or edit records. Use separate database files and operating-system access per company today. Before multiuser use, implement authenticated actors, tenant authorization in a service/database, transactional decision checks, immutable audit storage, retention/deletion policies, input limits, encryption/backups and a concurrency review. Reviewer names and authorization statements are local operator attestations, not verified identities. The current append-only API is not tamper-proof storage.

Imported material is only inert data: no shell, network fetching, templated commands, or model tools exist in this library. Adding model extraction requires a tool-free context and strict schema/evidence validation; keep operation review outside that model context. CLI request JSON is trusted operator input, distinct from the untrusted transcript.

UTern is independent of SparkTech. LEED, Ballot Watch, and future associated companies are potential adopters, not implemented integrations. Company-specific goals, data, credentials, brands, budgets and permissions must stay separate.
