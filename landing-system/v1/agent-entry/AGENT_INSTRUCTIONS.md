# Landing page agent instructions

Applies to Claude Code, Codex, and other coding agents. This file is the source of truth for the landing system. Read it before any landing page implementation or revision.

## Boundaries

- Work only in the named company's repository and use that company's confirmed brand, audience, product facts, product assets, approvals, and destinations.
- Keep company-specific data, secrets, credentials, budgets, access rules, and user records separate. Never copy them into another company's repository or a shared prompt.
- Do not connect accounts, call external services, publish, deploy, or send messages unless a separate explicit task authorizes that exact action.
- Do not invent customer names, outcomes, metrics, certifications, partnerships, product behavior, legal identity, or ownership.
- Do not convert synthetic UI data into implied live customer evidence. Label synthetic interface content visibly.
- Preserve existing worktree edits. Inspect status before editing, and make additive changes where possible.
- Keep the adopted site's framework and established components unless a scoped task explicitly approves a change.

## Required inputs

Use `brand-input.schema.json` as the contract. Before coding, identify missing or unresolved inputs. Each claim must point to local evidence or an approved source. A legal footer must use the exact verified entity text and evidence reference. If the source is missing, omit the claim and record the blocker.

## Build sequence

1. Inspect the target route, shared components, design tokens, repository instructions, and current worktree state.
2. Draft the page outline and copy from approved product evidence.
3. Make the brand visible through its own assets, typography, composition, and product-world details. Reusable structure must not flatten distinct brands into one visual template.
4. Use actual product UI when safe. Otherwise build a bounded illustrative view from approved facts and label it.
5. Implement responsive behavior, keyboard access, readable contrast, and reduced-motion behavior.
6. Run the local input validator and the repository's applicable checks. Do not add unrelated tests.
7. Review the rendered page only through an explicitly permitted preview path. If preview access is blocked, state that visual verification is blocked and provide source-level evidence.
8. Report changed files, evidence used, checks and results, unresolved inputs, and any publication gate.

## Writing rules

Use concrete copy. Do not use numbered feature blocks as a substitute for product explanation. Avoid generic AI claims, vague superlatives, false precision, and em dash punctuation. Link the primary action to a verified destination. Use a single clear primary action per major view.
