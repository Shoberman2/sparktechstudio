# UTern shared product and verification brief

Updated 2026-09-13. Coordination reference, not a new architecture proposal or certification of production behavior. Existing product documents and the user's explicit decisions govern; older operational claims require fresh verification.

## Established product

[README](../README.md) defines UTern as an internship platform: the student agent captures goals, relevant roles and truthful work history; with student consent, the employer agent turns that context into an evidence-backed reason to interview. Recruiters and enterprises needing interns and college students seeking internships are the two audiences. The current user's clarification reiterates the internal closed agent-to-agent process: employer needs and student goals/preferences/skill evidence inform fit assessment, gap explanations, learning, and consensual introduction or selection. Do not impose an external application form on that internal process.

[Living adaptive skills graph](designs/living-adaptive-skills-graph.md) separates demonstrated strength, role relevance and freshness. Accepted evidence changes canonical skill strength; goals do not. Practice is not automatically verification. AI suggestions cannot silently establish a student's capability. Employers receive consented evidence.

Internal journey: employer intake ↔ student intake and evidence → explained fit and gaps → relevant skill development → explicit consent → introduction/dialogue → scheduling and human selection → recorded outcomes. Agent messages alone do not establish consent, application, acceptance, verified skills, delivery or a booked meeting.

## Existing capabilities to reuse

[Sourcing and full-service roadmap](sourcing-and-full-service-roadmap.md) documents existing Connector double-opt-in introductions, discoverability-gated employer invitations, suppression checks, recruiting mandates and messaging consent. Its August 31 live/dark/missing statuses are historical, not current proof. Reinspect current implementations before building replacements: `src/lib/connector/server.ts`, `src/lib/enterprise/invites.ts`, `src/lib/messaging/consent.ts`, `src/lib/messaging/server.ts` and `src/lib/bobOutreach.ts`.

[Bob retention loop](BOB_RETENTION_LOOP.md) distinguishes suppressed actions from failed provider deliveries. [Agent voice](agent-voice.md) governs communications. [CODEX handoff](CODEX-HANDOFF.md) warns that the shared working tree, main and production may differ; use isolated checkouts and explicit ownership.

External-site AI Apply is a separate established capability: [README](../README.md) and [Apply Mode design](designs/apply-mode-extension.md) specify preparation/autofill with the student's final Submit. Verify resume persistence, actual generation, editable fields/documents, persistent review, external handoff and an authorized sandbox receipt. Do not treat a click or preparation as a submitted application. Historical design claims about competitors or risk are not freshly researched here.

## Verification and activation state

[September 13 live recheck](../deliverables/research/utern-independent-audit-2026-09-13/addendum.md) records recovered mentorship/fellowship listings, a Google GSI origin diagnostic, and no authenticated coverage of the 12 remaining areas. A full OAuth attempt has not established universal sign-in failure. [September 12 audit](../deliverables/research/utern-independent-audit-2026-09-12/report.md) is the earlier baseline.

[Activation inventory](../deliverables/research/utern-independent-audit-2026-09-12/activation-inventory.md) contains dated provider evidence. Resend receiving-domain/subscription/permission and real calendar consent require verification; Microsoft OAuth configuration was absent at that check. No named controlled recipient pair has been supplied. Preserve existing Google Workspace MX. Environment-variable presence is not proof of provider delivery, funding or successful integration.

Required completion evidence: intake → matching → mutual consent → introduction delivery → reply handling → booking/conflict/cancellation → opt-out/suppression → outcome records, plus the distinct external AI Apply journey. Record actual provider receipts and persisted states with exact release identity. Passing tests or a deployment alone does not establish completion.

## Ownership and unresolved decisions

Root audit/release task owns PR297 (catalog outage handling/calendar validation/readiness), PR298 (catalog quality filtering), coordinated releases and live audit. Spark implementation task `01a08e39-9f5e-7c62-931a-172fe50d7650` owns reusable existing relationship-system completion/evidence adapters in an isolated checkout. Recovery task `01a099a4-1189-7e32-b85c-87aa8e379f0c` owns database recovery diagnosis. Exchange file ownership before overlapping edits.

Naming remains unresolved: Prospie, Prospy and a Prospekt-style variant are candidates, not selected or legally cleared. Bob/Barb remain existing source identifiers. Authorized test participants, receiving-domain choice and any unavailable provider access remain concrete activation dependencies; audience descriptions do not supply recipients or approved campaign text.
