# Growth operations foundation

`rsei.growth_ops` reuses the existing company-scoped RSEI package for a bounded local workflow across multiple ICPs, outreach preparation, retention measurement, and SEO/AEO checks. Each run gets a separate input snapshot and company ID. Every record is checked against that tenant, source timestamps are checked against the company's freshness window, and outputs carry source hashes. It makes no network calls.

## Try the synthetic company

From `systems/recursive-improvement`:

```sh
python3 -m rsei.growth_ops inspect \
  --company-config pilot/growth-fixture/company.json \
  --input-dir pilot/growth-fixture \
  --run /tmp/sparktech-demo-run
```

The command produces `icp-discovery.json`, `outreach-plan.json`, `retention-audit.json`, `search-audit.json`, `proposal.json`, and `evidence.json`. Inspect the proposal, then stage its local page metadata edits only:

```sh
python3 -m rsei.growth_ops approve --run /tmp/sparktech-demo-run --proposal-id ID_FROM_OUTPUT --reviewer your-name
python3 -m rsei.growth_ops apply-local --run /tmp/sparktech-demo-run --proposal-id ID_FROM_OUTPUT
```

`candidate-pages.json` is a local candidate. The source pages remain unchanged and no production publish path exists. Changing any reviewed input invalidates the approval. Repeating apply is idempotent. Outbound drafts are never sent; the report names missing sender, audience, category and suppression authorization. Retention produces raw cohort rates from validated aggregate counts and may flag a cohort below the company's declared target for experiment design; it does not execute experiments or claim causal lift. Search checks are static metadata/content checks, can stage suggested title/meta/H1/FAQ content, and provide no ranking or answer-engine citation promise.

## Current limits and activation gates

Prospect matching only applies company-provided signal rules to company-provided records. It does not discover the market, validate people/contact details, enrich identities, or infer lawful contact permission. Outreach delivery requires an approved connector, exact company/audience/sender/message-category authorization, suppression controls, and per-ICP/contact budgets; this implementation has no send adapter. Retention requires a verified event taxonomy, cohort/eligibility windows, deduplication, consent/privacy review and a measured pre-change baseline before experiments can be judged. SEO/AEO production fixes require crawl/search-console/analytics integrations, content-owner review, staging verification, independent crawl checks, an approved release operator and tested rollback. None of those live gates is currently connected.

No Origami campaign state, suppression list, or hold is read or changed. Meeting-to-action remains a separate integration gap. The included fixture uses invented data and `.invalid` URLs.
