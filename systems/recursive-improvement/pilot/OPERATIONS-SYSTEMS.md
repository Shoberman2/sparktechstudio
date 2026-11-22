# Reusable company operations: local stage

## Stage boundary

This stage adds nine deterministic, fixture-driven operations to the existing
company-scoped RSEI package. Finance operations are intentionally excluded.
No adopter is enabled by these examples. No network access, customer message,
clinical decision, experiment execution, payment, publication, or deployment is
implemented here. Rules are explicit algorithms, not an AI worker or a claim
that a live integration exists.

### Stage 1: shared governance, QA, reliability

Acceptance: isolate state by company ID; reject cross-company and obvious
sensitive inputs; enforce byte/proposal/apply budgets; record hash-chained
activity; tie human approval to exact proposal hash and expiry; fail closed on
verification errors and preserve rollback; make replay idempotent. QA compares
observed journey steps with an explicit required sequence. Reliability counts
local incident outcomes and flags review; it never restarts a job.

### Stage 2: onboarding and support

Acceptance: onboarding reports exactly which owner-defined prerequisites are
missing and never activates a company. Support selects text only from approved,
same-company documents, returns source IDs and a human-review draft, or
escalates when overlap is insufficient. Sending is not available.

### Stage 3: feedback, customer success, knowledge, experiments, handoffs

Acceptance: feedback groups normalized tags and shows counts/evidence IDs while
leaving prioritization to an owner; customer success identifies stale aggregate
activity for human review without outreach; knowledge reconciliation preserves
source IDs and exposes conflicts; experiments validate required hypothesis,
metric, guardrails, sample floor and stop conditions without running; handoffs
require a named owner, evidence and explicit decision, and remain awaiting a
human.

## Local use

From `systems/recursive-improvement`:

```sh
PYTHONPATH=. python3 -m rsei.operations support --input pilot/operations-fixture/support.json
PYTHONPATH=. python3 -m unittest discover -s tests -p 'test_operations.py' -v
```

Other JSON inputs use the same `company_id` and workflow-specific fields; see
`rsei/operations.py` `_dispatch` and the test fixtures. The `spark-ops` entry
point is available after installing this source package. Results are local
JSON only. `Operations(root, company_id, ...)` creates a mode-0700 company
subdirectory, and stores `operations.json`, append-only `events.jsonl`, and
candidate artifacts there. Its output is not a tamper-proof audit service or
an OS boundary between mutually hostile processes.

To review an isolated change, call `propose`, inspect its exact input/candidate
hashes and evidence references, then call `decide` with a named human reviewer
and the proposal hash. Denials are terminal. An approved proposal can be
applied once; the supplied independent checker must return exactly `True`.
Failure restores the preexisting artifact (or removes the new candidate) and
requires a new proposal/approval. A second successful apply is a no-op.

## Capability status and live inputs

| System | Local capability | Live capability / minimum future inputs |
|---|---|---|
| QA/user journey testing | Required/observed step sequence evaluation; existing RSEI runner runs isolated tests and browser probes. | A company-owned staging URL, sanitized account/fixture, test selectors, allowed origin and reviewer-approved read-only test identity. |
| Reliability/error jobs/recovery | Local event classification and owner-review stop signal. | Approved monitoring/job read-only adapter, service/job identifiers, retention policy and named recovery owner. Recovery action remains separately gated. |
| Customer onboarding | Checklist reconciliation. | Company-approved onboarding requirements and owner-confirmed completion events; any account provisioning requires separate authorization. |
| Support | Approved-document overlap selection with citations and escalation. | Versioned approved docs, support taxonomy, freshness/retention rules and human queue adapter. No direct response send. |
| Feedback | Tag normalization/counts with evidence IDs. | Consented feedback source, allowed fields, deduplication policy and accountable triage owner. |
| Customer success | Threshold-based stale-activity flags, no outreach. | Privacy-reviewed aggregate activity definition, window, cohort exclusions and named reviewer. |
| Company knowledge | Reviewed source-backed fact reconciliation and conflict disclosure. | Company source inventory, named fact owners/reviewers, freshness periods and versioned source access. |
| Experiments | Design completeness validation only. | Owner-approved metric definition, instrumentation coverage, sample-size rationale, guardrails and stop authority. Execution needs separate experiment-platform permission. |
| Human handoffs | Evidence/hash/decision packet for a named owner. | Company escalation roster and authorized case queue; no external messages in this package. |
| Finance operations | **Not implemented by request.** | None in this scope. No reconciliation, invoices, forecasts, payment actions or finance module is added. |

Shared permissions are fixed to local fixture reads and isolated local artifact writes. External GET/send, publish, deploy, payments, clinical decisions and experiment execution are hard-disabled in this module. Budgets are local input bytes, proposal count, apply count, and a zero outbound quota. A named human stop blocks proposal creation and application.

A workflow's `status` is an evaluation of the supplied fixture. It does not
prove source truth, business impact, production readiness, model intelligence,
or causal effect. The caller is responsible for source authenticity and
retention. Keep each company's source data, evidence store, credentials and
budgets separate.

## Architecture walkthrough and terms

A caller supplies same-company JSON evidence. The workflow applies a documented
deterministic rule and returns a finding, draft, checklist, conflict, or
owner-review packet. If a bounded local file change is proposed, SparkTech
records a canonical hash over the company ID, workflow, input hash, candidate
hash, evidence references, and check requirement. A named person approves or
denies that exact proposal hash. Approval expires within an hour. The local
apply stage writes one isolated JSON artifact, invokes a separate check
callback, and restores/removes the artifact if checking fails. Replaying a
successful proposal returns `already_applied` and does not write again. A
human stop blocks new proposals and applies.

- **Tenant/company isolation**: each company ID has its own local operation
  directory. Mismatched IDs are rejected. This is application-level scoping,
  not a hostile-process OS security boundary.
- **Evidence ID/hash**: a caller-provided reference identifies evidence; SHA-256
  binds a proposal to exact canonical JSON bytes. It does not prove a source is
  true or immutable.
- **Approval gate**: a named reviewer decision bound to proposal hash and
  expiry. It is a local record, not authenticated identity or a signature.
- **Independent check**: a callback supplied by the caller must return exactly
  `True`; local tests prove fail-closed behavior but do not attest every future
  caller's checker independence.
- **Rollback**: failed check restores the previous artifact bytes or removes a
  just-created candidate. It does not roll back external systems.
- **Stop control**: named local stop switch; clearing it requires another named
  reviewer. It does not revoke running processes or block direct file edits.
- **Budget**: local ceilings for encoded input bytes, proposals, successful/
  attempted applies, and outbound operations (fixed at zero). Changing persisted
  limits or capability flags is rejected pending an explicit schema migration.
- **Evidence ledger**: append-only hash-linked JSONL events. This detects accidental
  edits when checked, but is not a signed or tamper-proof audit log.

This CLI is for serial local fixture use. It is not a multi-tenant service,
concurrent job scheduler, hardened sandbox, authenticated approval system, or
production recovery controller.
