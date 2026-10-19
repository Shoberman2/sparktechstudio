# SparkTech Landing System v1

An agent-neutral, local-first contract for building product landing pages across SparkTech companies. It defines shared quality gates and reusable primitives while requiring each company to supply its own identity, evidence, interface, privacy rules, and conversion path.

The package has no network client, account connector, credential handling, analytics dependency, or external publishing step. Copy it within SparkTech repositories as needed. Keep company inputs, assets, data, and approvals in that company's repository.

## Start here

1. Read `agent-entry/AGENT_INSTRUCTIONS.md` before editing a landing page.
2. Create a brand input file from `fixtures/brand-input.example.json`.
3. Add evidence references for every product claim and each visual.
4. Run `node tools/validate-brand-input.mjs path/to/brand-input.json`.
5. Build with the components in `components/LandingPrimitives.tsx` or use an existing site framework. The package does not require a framework migration.
6. Review the finished route against `QUALITY_GATES.md` and retain the evidence log with the change.

## Versioning

v1 treats brand identity as required input rather than a theme applied after the page is built. Add a new version directory for incompatible changes. Preserve a copy of each adopter's approved brand input and review record beside that site's source.
