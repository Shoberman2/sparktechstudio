# SparkTech Studios

## Mission

SparkTech Studios exists to build the crazy ideas that people think can't be done. We take unique, ambitious concepts and turn them into real products, fast and efficiently. The whole point is: you have a wild idea, we make it real.

## The Thesis (core positioning)

Anyone can build an app now. Almost nobody can scale one. AI closed the gap between an idea and something that runs, so building is no longer the hard part. What did not get automated is everything after: the product holding up when real users arrive, when the data gets messy, when the bill shows up.

Scaling a product now takes a **mix of AI and talent**. AI supplies the volume: boilerplate, first drafts, refactors, test coverage. Senior engineers supply the judgment: architecture, what is worth building, what breaks at scale, security and data, the call on what ships. Neither half gets there alone.

Supporting evidence we cite by name (verified, do not embellish): Marc Andreessen coined "AI vampires" for engineers running ~20 coding agents at once, sleeping less, roughly 20x more productive than a year ago. He named the catch in the same breath: **productivity is outrunning comprehension** — more code is being shipped than there are people who understand it. That gap is what we sell against.

Rules when writing about this:
- Never soften it into "AI replaces developers." The claim is the opposite: AI amplifies them, and amplification without judgment is the risk.
- Keep the Andreessen attribution accurate. He said 20x and "AI vampires"; do not invent other quotes, numbers, or names.
- Do not claim AI writes our code unsupervised, and do not claim we avoid AI. The point is that we run both, on purpose.

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

- `src/components/` - All page sections as individual components (Navbar, Hero, Thesis, Beliefs, Process, Showcase, Waitlist, Footer). Page flow: hero → thesis → why we exist → how we work → work → contact.
- `src/index.css` - Global styles, CSS variables, animations
- `public/logo.png` - Lightning bolt logo (transparent background)
- The hero visual is a **live terminal session built in React** (`Hero.jsx`), not an image or video. There is no photography on the site. Do not reintroduce a video or stock-image hero without asking.
- The terminal prompt user is `sparktech@studio` everywhere. Never shorten it to `spark@studio` — the brand is SparkTech.
- Accent color is a muted yellow/gold (`--accent-yellow`, `--accent-gold`)

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.
