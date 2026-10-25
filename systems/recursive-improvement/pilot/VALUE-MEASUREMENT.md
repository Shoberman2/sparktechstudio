# Repeatable customer value: definitions and baseline gaps

September 13, 2026. Decision: determine whether UTern reliably creates useful employer/student outcomes and whether people return for value. This preserves the full internal relationship, skill development and distinct external Apply vision. No numerical improvement target is justified before a trustworthy baseline. Release safety gates remain immediate; customer-value cohorts mature over days and do not automatically trigger rollback based on immature data.

## Recommended primary measures, definition version 1

| Metric | Population and formula | Evidence and decision |
|---|---|---|
| verified_value_14d | Distinct eligible employer/student relationships first completing both confirmed intakes in the UTC cohort window; numerator reaches an explained, provenance-backed appropriate match, explicit mutual approval, and verified delivered introduction or actual confirmed booking within 14 days of intake completion. | Join persisted intake/evidence/consent records to provider delivery or booking receipts; dedupe by relationship. Report which of delivery and booking occurred. Diagnose where intended value stops; do not substitute agent drafts or send acceptance. |
| meaningful_return_7d | Distinct eligible participants with a first verified value event in the UTC cohort window; numerator performs a new, human-initiated meaningful action on a later UTC date, more than 24 hours and at most 7 days after that event. | Server-confirmed actions: reviewed intake update, explicit match/consent decision, substantive reply, or new booking action. Exclude page views, login refresh, cron, agent-only activity and retries. Separate employer and student cuts in the owner's private analysis; do not pool identities across companies. |
| verified_interview_30d | Distinct eligible relationships with a first verified introduction in the UTC cohort window; numerator has an explicitly verified interview occurrence within 30 days. | Scheduled, interviewing status and inferred email classification alone are not occurrence proof. Retain evidence source and verification time. This is a slower downstream outcome; it cannot replace earlier learning or relationship value. |

Each denominator includes all eligible cohort members, including non-completers, and excludes documented test/internal/duplicate accounts. Unknown test status is a coverage gap, not permission to classify accounts. Freeze identity resolution and exclusion rules with a versioned query. Export only aggregates, source/query hashes and exact serving release identity. Mature the entire cohort window before computing a rate; zero eligible records means unavailable/empty cohort, not zero retention. Report numerators and denominators alongside rates. A changing release during a window must be disclosed and analyzed by exposure; one serving-release field is not causal attribution.

Drivers: confirmed-intake-to-appropriate-match completion, and mutual-approval-to-provider-verified-delivery completion with elapsed time. Guardrails: any confirmed post-STOP side effect needs immediate investigation; missing receipt/verification coverage blocks success claims. Neither features shipped nor account count is a primary KPI. Cohort composition and small samples limit comparisons. Set business targets only after the owner supplies verified baseline distributions and an agreed review cadence; weekly review is a provisional operating cadence.

## Existing sources inspected, no instrumentation edits

Code inspected at UTern `58b53b234bd4d41d25fe085c272d236a6ca079d4`, based on production PR297. Source manifest alongside this document records paths and hashes. This is code evidence, not a production data query.

| Source | Reusable evidence | Material limitation |
|---|---|---|
| connector/server.ts | Intake/workspace data, requester and recipient approval timestamps, introduction state, per-side delivery claims, learning outcomes | Per-side introduced timestamps follow sendEmail success; not verified inbox delivery. Declared learning is not skill verification. |
| connector/scheduling.ts | Selected time, booking RPC, per-side confirmation timestamps, cancellation states | Selection/confirmation email is not independent provider-calendar acceptance or interview occurrence. |
| enterprise/metrics.ts | Existing funnel, source mix, time-to-fill and role progress | Current status aggregates are not longitudinal cohorts. rubricFit includes declared skill strings and positive match labels; insufficient to certify proven appropriate match. Hours saved uses an explicit six-minute assumption. |
| agent/outcomeSync.ts | Source-labelled application_status_events with repeated-status deduplication | Writes are best-effort; event completeness must be measured. Status is not proof of occurrence. |
| agent/posthog.ts | Existing chat/outcome/synthesis capture and session-pattern queries | Capture requires POSTHOG_CAPTURE_ENABLED; configured keys do not prove capture. Fire-and-forget and query availability require coverage verification. Session patterns are not mature return cohorts. |
| api/agent/events/route.ts | Existing authenticated event ingestion | Client events and timestamps are not authoritative provider receipts. Preserve source trust. |
| api/admin/agent-metrics/route.ts | Existing cost and save-rate views | Does not define the complete relationship funnel or verified return cohorts. |

## Baseline

All three primary KPI values are **unmeasured**, not zero. No governed aggregate export with query, population exclusions, receipt joins and cohort maturity has been supplied. The coordinator's 608 auth accounts and 200 accounts with last_sign_in_at in 30 days are unverified inventory claims for this analysis; they are neither MAU nor retention. Authentication blockers also prevent this task from completing the controlled live journey. Root UTern owner owns any minimal missing instrumentation after the authentication release; Spark consumes the evidence without duplicate event writes.

## Integration contract

`rsei.value_metrics.validate` checks version 1 aggregate field allowlists, evidence/query hashes, exact serving release identity, complete collection coverage, deduplication, test exclusions, counts and mature windows. Its accepted evidence basis is metric-specific. The owner must actually verify those attestations against private source rows; local validation does not independently prove them. No raw contact, message, user ID or event payload is accepted.

Import a JSON array through `python3 -m rsei.pilot value-metrics --run <run> --input <aggregate-file>`. The pilot requires current reconciled context, writes a separate customer-value section and never converts login counts into outcomes. `target_met` remains null and `causal_improvement_verified` false. No automatic deployment, campaign or analytics-vendor activation is part of this contract.
