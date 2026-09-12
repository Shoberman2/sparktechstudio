# Recursive Self-Enterprise Improvement: website review

## Recommended implementation

- Owner: Redesign SparkTech website, task `01a073c1-e294-7ba0-badc-68baad0ba29a`.
- Checkout: `/Users/shoberman/sparktech`.
- Preview: http://127.0.0.1:5174/ (the duplicate worktree uses 5173).
- Entry: `src/App.jsx` → `src/components/VentureSite.jsx` and scoped `VentureSite.css`.
- New positioning and metadata use the exact name Recursive Self-Enterprise Improvement.

## What changed

A cohesive minimal operating-model site: hero and cycle diagram, thesis, interactive six-stage loop, five system areas, adoption boundaries, intended companies, contact. The QA example explicitly labels itself illustrative. Native system disclosures give more detail without a long wall of text. Previous animations, Sisyphus video, and prior site components remain on disk but are unmounted. The mockup lab is unchanged.

SparkTech owns the reusable systems. Each company has separate data, credentials, brand, goals, budgets, and permissions. UTern is explicitly not owned by SparkTech. LEED uses the verified repository spelling and existing leed.media URL; Ballot Watch and LEED have intended-adoption descriptions without invented ownership. No claims that integrations are live, no metrics or testimonials, and no guaranteed autonomy. Recursive learning covers the automation workflows themselves.

## Duplicate task comparison

Inspected `/Users/shoberman/.codex/worktrees/6204/sparktech/src/studio/Studio.jsx`. That version has separate capability pages and an interactive company selector. The final recommendation keeps this checkout’s single-page explanation and interactive six-stage loop for a simpler, more coherent reading of the exact vision. Retained useful ideas in the content: explicit correction after failed verification, meaningful outcomes instead of clicks, and keep/revise/revert experiment decisions. No wholesale code merge. Duplicate task was asked to pause and not deploy.

## Verification

- Production build and ESLint pass; git diff whitespace check passes.
- Browser: 1440px desktop, 768px tablet, 375px mobile. Mobile/tablet have no horizontal overflow; logo images load, one h1, and all internal anchor targets resolve.
- Tab click, ArrowRight, Home/End, and Next controls update the selected stage and associated panel. Keyboard focus tracks selected tabs.
- Native system accordion opens the selected system and closes the previous one.
- Browser console has no errors.
- Share card visually inspected at 1200×630; OG cache version 6.

## Scope

This delivers the website and explanatory interactions, not operational agent integrations. No public deployment, social outreach, account setup, or UTern changes were performed.
