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
- **LEED** (verified repository spelling; voice transcription said LEAD; existing site link `https://www.leed.media`) and **Ballot Watch** are part of the intended adoption direction. Do not infer or assert ownership.
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
- Page flow (light direction, 2026-09-11): white nav → white two-column hero with the spinning six-stage loop (Observe, Select, Approve, Implement, Verify, Learn) → "The idea" gray band (heading and one paragraph) → four layers in a ruled row → eight named workflows in a hairline grid with emblems and IDs (ST-01 to ST-08) plus one honest status line → three ruled company columns → dark About band → dark contact band → four-column footer. The concept name belongs in the footer; avoid lengthy model explanations.
- `src/mockups/` is the historical concept lab at `/mockups`; do not restyle it.
- Older components and assets remain on disk, including the animated logo, intro, Sisyphus video, and generated sculpture. They are not mounted by the new operating-model site. Do not delete them as incidental cleanup.
- `src/data/projects.js` remains historical product data, not an ownership register or evidence that system integrations are live. The new site uses the specifically requested companies, with explicit intended-adoption language.
- `public/logo.svg` is the spark mark. `public/og.png` is the current 1200×630 share card; bump `?v=` in `index.html` when regenerated.
- Brand remains **SparkTech Studio**, singular. Copyright is **SparkTech Studios, LLC**, the registered entity.
- No invented team, metrics, testimonials, client ownership, active integrations, or guaranteed perfect autonomy. No social posting or account changes authorized by the website task.
- Founder section (2026-09-11): the user asked for the site to say who he is. One About section, first person, facts only: Spencer Hoberman, founder of SparkTech Studio, New York, building the first pilot, also builds UTern which stays independent. No credentials, employers, ages, or photos unless he supplies them. Everything else on the page stays in studio voice.

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.
