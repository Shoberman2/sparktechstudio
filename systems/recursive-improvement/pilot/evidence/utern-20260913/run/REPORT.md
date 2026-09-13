# UTern pilot outcome
Run: run
Status: awaiting_candidate_identity
Mode: external-owner; UTern is independent of SparkTech.

| Metric | Status | Value | Scope | Evidence time |
|---|---|---|---|---|
| catalog_available | passed | True | production | 2026-09-13T08:25:18.485283+00:00 |
| catalog_latency_ms | passed | 547.48 | production | 2026-09-13T08:25:18.485283+00:00 |
| mcp_reachable | passed | True | production | 2026-09-13T08:25:18.761689+00:00 |
| auth_endpoint_reachable | passed | True | production | 2026-09-13T08:25:18.986736+00:00 |
| sign_in | blocked | False | production | 2026-09-13T08:43:00+00:00 |
| model_generation | passed | True | local | 2026-09-13T08:36:39.157Z |
| employer_needs_confirmed | blocked | None | production | 2026-09-13T08:46:42.066026+00:00 |
| student_preferences_confirmed | blocked | None | production | 2026-09-13T08:46:42.066497+00:00 |
| skills_provenance | blocked | None | production | 2026-09-13T08:46:42.066974+00:00 |
| explained_match | blocked | None | production | 2026-09-13T08:46:42.067427+00:00 |
| mutual_introduction_consent | blocked | None | production | 2026-09-13T08:46:42.067894+00:00 |
| meeting_flow | blocked | None | production | 2026-09-13T08:46:42.068336+00:00 |
| stop_enforced | blocked | None | production | 2026-09-13T08:46:42.068777+00:00 |
| sandbox_apply_receipt | blocked | None | production | 2026-09-13T08:46:42.069224+00:00 |
| native_submit_preserved | blocked | None | production | 2026-09-13T08:46:42.069679+00:00 |

## Release and decision
{
  "base": {
    "deployment_id": "dpl_Pi18e8FTc3bGTNQ2J6ep2gqb3AHn",
    "commit": "f3fff71a19630a481bd6cbb49b8b400c4d6b2093"
  },
  "candidate": {
    "deployment_id": null,
    "commit": "58b53b234bd4d41d25fe085c272d236a6ca079d4"
  },
  "blockers": {
    "deployment_id": "Owner has not supplied an exact candidate deployment identity"
  }
}

No sign-in, model generation, application receipt or meeting success is inferred from public service availability.
Live repair/deploy/rollback is owned externally. Fixture receipts are never accepted as live deployment evidence.

## Provisional internal identities
- Pip (observer v1): Observer; Curious and concise. Capability: Read-only probes and imported observations.
- Ada (diagnostician v1): Diagnostician; Methodical and skeptical. Capability: Evidence classification and bounded proposals; no model diagnosis claimed.
- Kit (builder v1): Builder; Practical and inventive. Capability: Fixture repair subprocess; optional credential-dependent Codex adapter; UTern fixes owned externally.
- Vera (verifier v1): Verifier; Precise and independent. Capability: Independent tests, evidence integrity and release gates.
- Otto (release-operator v1): Release operator; Calm and conservative. Capability: Local fixture release; UTern release and rollback owned by designated external task.
- Mira (outcome-analyst v1): Outcome analyst and librarian; Reflective and evidence-focused. Capability: Metric comparisons, bounded evaluations and reviewed lesson export.
