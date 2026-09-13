# UTern pilot and relationship adapter

This extends the tested repair runner and source-backed knowledge ledger with a UTern evidence workflow. UTern is an independent company. This is not certification that its live relationship or Apply journeys work.

## What runs

`rsei.pilot` records bounded public GET observations, imports owner reports with source hashes, reconciles company context, proposes an exact candidate, evaluates preview and production gates, and records private lessons. A real subprocess fixture exercises local deploy, failed outcome, rollback and post-rollback verification. Production deployment and rollback remain exclusively with the designated UTern owner; the pilot does not call production release APIs. Owner IDs are local attestations, not cryptographic authentication.

`rsei.relationships` calls existing UTern relationship routes rather than duplicating matching, consent, mail delivery, reply processing or calendars. It requires company context, explicitly scoped test actors, an exact expiring action approval, and a server identity check. The example enables only read routes and has no actors or credentials. Transport tests use doubles; no live relationship calls were made. HTTP success never establishes delivery, consent, skill verification, selection or a booked meeting.

`agents.json` provides six versioned internal identities: Pip observes, Ada diagnoses, Kit builds, Vera verifies, Otto coordinates release decisions, and Mira records outcomes and lessons. The runner snapshots identities into evidence and repair tasks. These are role metadata, not six autonomous deployed agents; their names confer no permissions.

## Context and knowledge

Before pilot proposal, evaluation or relationship actions, provide reviewed mappings for product documents, decisions, current work and explicit instructions. Each includes company ID, source path and SHA-256, reviewer, recorded time, expiry and accepted constraints. Relevant prior conversations are captured as attributed operator notes, not fabricated user instructions. Latest explicit instructions override earlier mappings; equal-priority unresolved conflicts, stale or changed sources block action. Retrieval is explicit source selection and reconciliation, not automatic semantic search.

Every enterprise implementation should apply this contract before work. The standalone deterministic repair fixture is context-independent; this change does not retroactively deploy the contract into every enterprise agent. Company-local excerpts and evidence remain private. `lesson.json` is a proposal with disclosure approval false; cross-company sharing must use the existing knowledge ledger's disclosure review. Identity metadata cannot expand execution or sharing permissions.

## Run locally

From `systems/recursive-improvement`:

```sh
python3 -m unittest discover -s tests
python3 -m rsei.pilot init --run .runs/new-utern-pilot
python3 -m rsei.pilot context --run .runs/new-utern-pilot --input /absolute/path/context-records.json
python3 -m rsei.pilot probe --run .runs/new-utern-pilot --probe catalog
python3 -m rsei.pilot propose --run .runs/new-utern-pilot --input /absolute/path/release-pair.json
python3 -m rsei.pilot report --run .runs/new-utern-pilot
```

Release-pair input contains `base` and `candidate`, each with exact `commit` and `deployment_id`. A pending candidate may have a null deployment ID; it cannot pass release gates. Do not retrofit preview evidence to a squash commit or treat a pre-existing owner deployment as an action executed by this pilot. Receipts must match an unused authorization, owner, from/to identities and evidence; authorization is not a deploy command. After a rollback, fresh evidence must postdate its receipt.

Relationship operations expose `plan`, `approve` and `execute` with `--policy`, `--request`, and `--state-root`; approval additionally requires `--reviewer` and `--approve-action`. Configure environment slot names, never literal secrets. Human-decision operations require `decision_authority: human` and explicit approval; this flag cannot manufacture consent. Each approved action is claimed once before network access, with no automatic retry after unknown results. A call performs an identity GET plus the requested operation, each with a bounded timeout; the budget counts actions. Inspect actual persisted UTern/provider receipts separately.

## September 13 result

See [recorded pilot report](evidence/utern-20260913/run/REPORT.md). Public catalog availability and local synthetic model generation passed within their narrow scopes. Owner reported PR297 production READY and a Google origin error blocking authenticated testing. The relationship suppression repair is pushed on `codex/relationship-stop-revalidation`; User approval was subsequently relayed and automatic review allowed PR creation. GitHub GraphQL failed twice and REST returned an incomplete response; reconciliation found no PR. Creation remains blocked by GitHub, not approval. Historical evidence below preserves the earlier approval-pending state.

Full live completion still requires authenticated journey evidence, controlled employer/student participants, receiving/reply access, calendar consent and actual persisted outcomes. No introduction, meeting or external application was executed by this pilot. The exact candidate deployment is absent, so the outcome is `awaiting_candidate_identity`, with no measured production improvement or rollback claimed. Archived evidence has local absolute paths and intentional expiry; it is historical evidence, not a portable reusable authorization.

Repeatable customer-value definitions and existing-source gaps: [measurement contract](VALUE-MEASUREMENT.md). The `value-metrics` command imports governed aggregates separately from release health checks.
