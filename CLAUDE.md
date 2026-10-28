# SparkTech Studio

## Current mission and positioning (2026-09-10)

The user named the vision exactly **Recursive Self-Enterprise Improvement**. This supersedes the earlier agency and idea-development-only positioning.

SparkTech is an incubator and product/website creator that **owns reusable agentic systems** for continuously running and improving companies. SparkTech ventures and outside companies are intended to adopt those systems with separate data, credentials, brand, goals, budgets, and permissions.

The loop: observe results → select improvements → implement → verify → learn → repeat. Recursive also means evaluating and improving the automation workflows themselves, not only the products they work on.

System areas:
- Knowledge: agents read approved podcasts, transcripts, and notes for a company and turn them into evidence-backed, testable proposals (added 2026-09-11 from the Codex voice thread).
- Computer/browser-use QA discovers and reproduces bugs, implementation fixes them, and retesting plus release verification close the loop.
- Daily maintenance.
- Analytics-led experiments and measurable product improvements.
- Social content workflows across X, TikTok, and other platforms.
- Operations and customer support.

Infrastructure (2026-09-11): the site describes four layers, which mirror the local prototype Codex built on the `codex/recursive-improvement-foundation` branch in its worktree: company boundary (separate data, credentials, brand, goals, budget, permissions), knowledge ledger (approved sources in, exact evidence out), review (a person approves scope, budget, permissions; approval is scoped and expires), and runner (reproduce, repair in isolation, verify in a real browser, keep evidence).

Honest status (2026-09-11): the prototype works locally on a fixture with a person approving each run. First pilot is next (one real product, one repeatable QA-to-fix loop, then a second company). Continuous and recursive stages are planned. The site says exactly this and nothing more.

Present this as the operating model and direction. Do not claim that all workflows or integrations are already running, and do not imply guaranteed perfect autonomy. Keep judgment, scoped permissions, evidence, and company-specific decisions explicit without turning the site into a compliance checklist.

## Companies and factual boundaries

- **UTern is NOT owned by SparkTech.** It is an outside company intended to use the systems.
- **Leed** and **BallotWatch** (spellings chosen by the user on 2026-10-16 to match the live sites; earlier notes said LEED and Ballot Watch) are part of the intended adoption direction. Do not infer or assert ownership.
- Future associated companies and outside companies may follow the model. Shared systems do not imply shared company data or ownership.
- No fabricated numbers, testimonials, titles, team headcounts, guaranteed outcomes, or claims that these integrations are live.

## Brand Voice

- Direct, confident, human. Not corporate, not salesy.
- Emphasize that no idea is too out there. We want the weird ones, the ambitious ones, the ones other studios would turn down.
- Speed and efficiency are how we work, not what we sell. The sell is: we'll actually build that thing you've been thinking about, and it will still be standing when it gets traffic.
- Never sound like AI-generated copy. No em dashes. No buzzwords like "leverage," "synergy," "cutting-edge," or "innovative."
- Keep it conversational. Write like you're talking to someone at a bar, not pitching a VC.

## Tech Stack

- React + Vite
- Deployed on Vercel
- CSS modules (per-component .css files)
- No UI framework (custom CSS)

## Project Structure

- React + Vite. `src/App.jsx` mounts `src/components/VentureSite.jsx`; its styles are scoped in `VentureSite.css` so the historical concept lab is preserved. VentureSite has its own pathname router (no library): `/` is the full page, and `/idea`, `/how-its-built`, `/workflows`, `/companies`, `/about`, `/contact` are section pages. `vercel.json` rewrites every path to index.html, so these work on Vercel.
- Page flow (white sheet, 2026-09-17, concise pass): white nav with home-page scroll-spy → full-viewport hero: three-line giant headline, one sentence, one button, one text link → the six-stage loop (Observe, Select, Approve, Implement, Verify, Learn) as a full-bleed track on the hero's bottom edge whose gold line grows stop to stop → "The idea" (giant heading, two short lines) → four layers as sticky stacking cards → eight named workflows as one-line ruled rows with the honest status line beneath → three big-type company rows → About (lead and one paragraph) → left-aligned giant contact → three-column footer. Two fixed hairlines frame the page with crosshairs where sections meet; the left one fills gold with scroll. The concept name belongs in the footer; avoid lengthy model explanations. Details in DESIGN.md, tenth pass.
- Offer and trust pass (2026-10-15): the main invitation is "hire us to build your product"; the loop is the optional after-launch step, labeled pilot. Home adds `Offer` (/build: call, written scope, build and launch, after launch) after the hero and `Proof` (the loop's 2026-10-11 unattended fix of this site, commit 4c45203) before Companies. Each workflow carries a status: Pilot (Scout, Mechanic, on sparktechstudio.com), Prototype (Scribe, Warden), Planned (the rest). Reply window is 2 business days. Code ownership, access, release approval, and support terms are deferred to the written scope; do not state specifics until Spencer supplies them. `/privacy` describes what the contact form actually does. No product screenshots (DESIGN.md anti-pattern).
- **Form direction (2026-10-15, current):** `src/App.jsx` now mounts `src/designs/Form.jsx` at `/` (white, "We create the future.", a 3D point cloud that starts as the gold SparkTech spark and morphs through sphere, ring, helix, lattice, wave; each product has its own form). Order: hero → systems overview (loop ring, areas marked Live/Next, honest status) → What we've built → contact. Company pages at `/work/<slug>` (`src/designs/Company.jsx`, copy in `src/designs/content.jsx`, assets in `public/work/`). Sections below the hero follow Direction A from the Claude Design canvas (https://claude.ai/artifact/P4EB5mawuKTvfQsxGK35Ay, 2026-10-16): systems kept deliberately broad on the homepage (2026-10-16, per user): one headline, one paragraph, and a link to `/systems`, a prerendered page (`src/designs/Systems.jsx`) that explains the program broadly: the five-step loop, where it runs, the limits people keep, and the honest status. Per user, no individual agents or their tasks are named anywhere on the site No stages, no loop diagram, no run receipt, no area list on the homepage; work as five colored tiles with each company's own figure; a dark footer with the contact CTA, link columns, and a ghosted wordmark. No 'Studio · year' meta, no rule under the hero. Headlines read as one story (2026-10-16): h1 'We build the things other people only talk about.' (swapped in on the audit's advice; 'We create the future' moved into the subhead) → 'And we never stop improving them.' → 'What we've built so far.' → 'What should exist next?'. Spacial's tile is its brand violet #7255ff. Buttons are pills (radius 999px) with a soft white-to-gold gradient and lift on hover; no rectangular buttons. **Prerender:** `npm run build` runs `vite build`, an SSR build (`vite.ssr.config.js`), then `scripts/prerender.mjs`, which writes real HTML for `/` and every `/work/<slug>` (both `work/<slug>.html` and `work/<slug>/index.html`), per-route title/description/canonical, and `sitemap.xml`; `src/main.jsx` hydrates when markup is present. Unknown routes render `NotFound` (also written as `dist/404.html`; there is no catch-all rewrite in `vercel.json` any more, so Vercel serves it with a real 404). `/privacy` is a prerendered page; keep it true if analytics, a form, or a third party is ever added. Company pages get their own `og.jpg` (captured from each hero) and `og:url`. `vercel.json` sets long cache on `/assets` and basic security headers. Primary call to action everywhere is the Calendly link in `content.jsx` (`CALENDLY`). **Buttons and hero (2026-10-16, per user):** one button style for the whole site, `src/designs/buttons.css` (`.btn` solid pill, `.btn-ghost` outlined, both warm to gold on hover; no icons or arrows inside buttons; `.on-dark` and `.co-page` invert the colors). Never mention a call length ("30 minutes") in the UI; the label is "Book a call". The email address is never printed on a page; an "Email us" button or link opens mailto. The hero is centered: Title Case h1 'We Build the Things Other People Only Talk About.', the subhead, the two buttons, then the point cloud below. The dark footer is shared (`src/designs/Footer.jsx`), used by the home page and `/systems`. The homepage link to `/systems` reads "How it works"; the nav item is "System". `/systems` is built around one animated loop diagram (SVG ring, five nodes, traveling gold dot) plus five area chips, three short promises, and the status line; keep it visual and broad, not wordy. `public/robots.txt` and `public/llms.txt` describe the site for crawlers and AI agents; `index.html` carries Organization JSON-LD. `App` takes `path` as a prop so it renders without `window`. The three explored directions remain at `/designs/1-3`. VentureSite and the sections above it are on disk but unmounted. Copy was audited against each company's repo and live site on 2026-10-15; keep "Live today" and "Where it's going" separate. spacialhealth.com still serves the old allergy app, so the Spacial page does not link out until the new site deploys. Budtender has no public URL.
- **Agency rebuild (2026-10-27, branch `site-rebuild`, per `.rebuild-plan.md`):** positioning leads with AI web apps and MVPs, with law/finance/medical sites second. Published prices live in `pricing` in `content.jsx` (Launch Site $12k to $25k, Care $1,000 to $1,500/mo, Growth $3,000 to $5,000/mo); everything else is "priced in a written scope after a call". New pages render from `src/designs/pages.jsx` through `src/designs/Page.jsx`: `/services` plus five service pages, `/industries/professional-services`, six `/locations/*` pages, and the `/work` hub. Case studies are UTern, Leed, BallotWatch and Validate-s (`studies` and `workSlugs` in `content.jsx`); Spacial Health keeps its page but isn't listed. **Never mention Budtender** (removed from the site, its page and assets). Every service page links two case studies and has Book a call. Missing proof is a visible TODO box, never invented copy; location pages stay `noindex` until they have real local proof (see TODOS.md). `index.html` carries Organization + ProfessionalService JSON-LD for SparkTech Studio, New York, NY (areaServed only: there is no public street address or phone, so no LocalBusiness), to separate it from the unrelated sparktechstudios.com in Ontario. The primary host is `https://www.sparktechstudio.com` (the apex 308s to it). Every service page has a four-question FAQ (cost, timeline, stack, code ownership) with FAQPage JSON-LD, copy in `faqs` in `pages.jsx`. The industry page is noindex while it has a TODO; `/work/spacial` is noindex and out of the sitemap. The prerender fails the build on any title over 60 characters. No `sameAs` until the studio has its own public profiles. **Pricing, partners, booking (2026-10-27):** `/pricing` (noindex, TODO until Spencer confirms the numbers; retainers read as maintenance, SEO and AI features) and `/partners` (indexable, in nav and sitemap) render from `pricingPage` and `partnersPage` in `pages.jsx`. Every Book a call spreads `BOOK` from `content.jsx`; `CALENDLY_URL` is empty (TODO) so it falls back to mailto. Home has an About section with founder photo and bio TODOs. Every footer says 'Not affiliated with sparktechstudios.com (Ontario)'.
- `src/mockups/` is the historical concept lab at `/mockups`; do not restyle it.
- Older components and assets remain on disk, including the animated logo, intro, Sisyphus video, and generated sculpture. They are not mounted by the new operating-model site. Do not delete them as incidental cleanup.
- `src/data/projects.js` remains historical product data, not an ownership register or evidence that system integrations are live. The new site uses the specifically requested companies, with explicit intended-adoption language.
- `public/logo.svg` is the spark mark. `public/og.png` is the current 1200×630 share card; bump `?v=` in `index.html` when regenerated.
- Brand remains **SparkTech Studio**, singular. Legal entity is **SparkTech Studios, Inc.**, a Delaware C corporation (user, 2026-10-16). Copyright lines and JSON-LD use that name; the earlier LLC name is retired.
- No invented team, metrics, testimonials, client ownership, active integrations, or guaranteed perfect autonomy. No social posting or account changes authorized by the website task.
- Founder section (2026-09-11): the user asked for the site to say who he is. One About section, first person, facts only: Spencer Hoberman, founder of SparkTech Studio, New York, building the first pilot, also builds UTern which stays independent. No credentials, employers, ages, or photos unless he supplies them. Everything else on the page stays in studio voice.

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
