# Design System — SparkTech Studios

## Product Context
- **What this is:** A dev studio that builds ambitious, unconventional product ideas fast
- **Who it's for:** People with wild product ideas who can't afford a big agency and need more than DIY
- **Space/industry:** Creative development studio / software agency
- **Project type:** Marketing site (single-page, React + Vite)

## Aesthetic Direction
- **Direction:** Terminal / old-classical computing. The whole page reads like a console session being generated live.
- **Decoration level:** Intentional — CRT scanline overlay + paper grain, monochrome terminal window chrome (title bars, traffic-light dots, prompts), ASCII tree structures. No rounded cards, no gradients, no decorative blobs.
- **Mood:** A serious custom-build studio that ships real products. Old IBM/teletype heritage meets craft. Confident, technical, a little irreverent. Reads as engineering, not marketing.
- **Anti-patterns:** No blue (text and ink are warm true-black, never cool-cast), no purple gradients, no rounded "AI card" grids with soft shadows, no centered-everything hero, no generic concept-page whitespace without proof.

## Typography
- **Display/Hero:** IBM Plex Mono (700) — the headline is typed out character by character with a blinking caret.
- **Body:** IBM Plex Mono (400/500) — monospace everywhere. Reinforces the terminal feel.
- **UI/Labels:** IBM Plex Mono (600/700) — prompts, nav, tags, buttons.
- **Classical flourish:** IBM Plex Serif (italic) via the `.serif` class — used sparingly for one emphasis word ("crazy") and the about-section quote. The single "classical" note against the mono.
- **Code/Data:** IBM Plex Mono (400)
- **Loading:** Google Fonts CDN — `IBM+Plex+Mono` (400–700 + italics), `IBM+Plex+Serif` (italic), `Space+Mono` as fallback
- **Scale:**
  - Hero: clamp(2.6rem, 8.5vw, 6.5rem), letter-spacing -0.04em
  - Section heading (`// comment` style): clamp(1.7rem, 3.4vw, 2.5rem)
  - Card/panel heading: 1.1–1.2rem
  - Body: 0.9–1rem (19px base)
  - Prompt lines: 0.8–0.92rem
  - Tags / micro labels: 0.68rem, often uppercase letter-spacing 0.1–0.16em

## Color
- **Approach:** Warm-black ink on warm paper with a single gold accent. Color is rare and meaningful — gold marks the cursors, prompts, the "spark", and primary actions; everything else is ink.
- **Paper (bg):** #f3f0e7 — warm off-white, like a printout
- **Paper dim:** #ebe7da — alternating sections, title bars
- **Panel:** #f8f6ef — terminal window bodies
- **Ink (text primary):** #14130f — warm true-black, no blue cast
- **Ink soft (secondary):** #45433b — body copy
- **Ink faint (muted):** #8b887b — labels, comments, branch glyphs
- **Hairline:** rgba(20,19,15,0.22); strong rgba(20,19,15,0.55)
- **Accent (gold):** #b8860b (DarkGoldenRod) for non-text marks — the blinking caret (the signature spark), the `[live]` badge, primary CTA fill, hover fills. #7a5a0a (deeper gold, WCAG AA on paper) for accent *text* — the `spark@studio` prompt, `#` tags, the service index numbers, and the serif "crazy".
- **Why warm-neutral, not cool:** the previous palette (#1a1a1e / #55555e / #8a8a95) carried a blue undertone (blue channel > red/green) and read as "blue." All ink values are now R ≥ G ≥ B.
- **Dark mode strategy:** none currently — the light "paper terminal" is the identity. If added: invert to paper text on ink, keep scanlines.

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable but denser than before — sections carry proof and concrete content, not empty whitespace. Section padding ~104px desktop / ~72px mobile.
- **Scale:** 2xs(4) xs(8) sm(16) md(24) lg(32) xl(48) 2xl(64)

## Layout
- **Approach:** Left-aligned, structured, terminal-document feel. Each section opens with a typed prompt line + `// comment` heading.
- **Max content width:** 1180px
- **Border radius:** 0 everywhere (terminal squares). Only the traffic-light dots are round.
- **Elevation:** hard offset shadow (`4px 4px 0 0 var(--ink)`) instead of soft blurred shadows — a printed/stamped look, not a floating-card look.
- **Breakpoints:** mobile(<600px) tablet(600-900px) desktop(>900px)
- **Page framing:** the fixed navbar is the window title bar (traffic-light dots + `sparktech-studios` + blinking caret); the footer ends in a perpetual live `spark@studio:~$ █` prompt.

## Motion
- **Signature:** Typewriter. The `<Typewriter>` component types text char-by-char once it scrolls into view, with a blinking gold caret. Scoped to two places only: the hero headline (the title — the gold underline on "crazy" draws in as it types) and the whole About ("why we exist") section (its prompt, heading, and body, which types block by block in sequence via the `gate` prop). All other sections render their prompts and `// headings` statically. Ambient (non-typing) blinking carets remain in the navbar, the contact `$ mail` line, and the footer. Honors `prefers-reduced-motion` (renders full text, static caret).
- **Caret:** `.tw-caret` — 0.62em × 1.02em gold (`--accent-yellow`) block, `blink` keyframe at 1.05s steps(1).
- **Scroll reveal:** IntersectionObserver + MutationObserver, threshold 0.15, short translateY(18px) entrance with stepped easing.
- **Transitions:** quick and stepped (`steps()`), not smooth/floaty — UI snaps like a console. Hovers invert colors or nudge the hard shadow.
- **Overlays:** fixed CRT scanlines + vignette (multiply) and a low-opacity grain layer.
- **Reduced motion:** disable caret blink and reveals, set final state immediately.

## Component Patterns
- **Buttons:** Square, 1px ink border, mono label, often bracketed (`[ start_a_project ]`). Primary = solid ink + paper text + hard offset shadow; hover inverts to paper + ink. No pills.
- **Panels / "cards":** Square terminal windows — optional title bar (`.term-bar` with `.term-dots` + `.term-title`) over a `.term-body`. Hard offset shadow, hairline borders. This replaces the old rounded white card.
- **Prompt line:** `.prompt` with `spark@studio:~$` then a typed command. Opens most sections.
- **Headings:** `// comment`-style, typed.
- **Tags:** Square, 1px hairline border, mono, prefixed with `#`.
- **Work list:** ASCII tree (`├──` / `└──`) from `sparktech-studios/` to each live project, each shown as a terminal window with a `[live]` badge, `does:` / `built:` lines, and tags.
- **Contact:** a terminal window where the email types itself into a `$ mail …` prompt with a persistent caret; the whole line is the mailto link.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-23 | Initial design system created | Created by /design-consultation based on existing codebase + competitive research |
| 2026-03-23 | Keep Playfair Display + Space Grotesk | Existing pairing works — distinctive without being precious |
| 2026-03-23 | Warm off-white over dark theme | Differentiator — every studio site is dark. Warm cream = craft, not corporate |
| 2026-03-23 | Restrained color (gold-only accent) | One accent color = stronger identity |
| 2026-03-23 | Asymmetric layouts over card grids | 3-column icon card grid is AI slop pattern #1 |
| 2026-03-23 | Grain texture overlay kept | Adds warmth and tactile quality |
| 2026-05-26 | Shift accent to goldish brown (#b8860b/#7a5a0a) | Warmer, less neon |
| 2026-06-26 | **Full pivot to terminal / old-classical aesthetic** | Per user direction. Make the brand color true black (the old ink had a blue undertone and read "blue"); make boxes look less AI (square terminal panels + ASCII tree, no rounded gold cards); give it a techy old-classical, terminal feel. |
| 2026-06-26 | Drop gold accent → monochrome warm-black ink on paper | Black is the spark. One ink, inverted for emphasis. Removes the cool/blue cast (all ink now R ≥ G ≥ B). |
| 2026-06-26 | IBM Plex Mono everywhere + IBM Plex Serif italic flourish | Mono = terminal; Plex's IBM heritage = "old classical computing." Serif italic kept for one classical accent. |
| 2026-06-26 | Typewriter as the signature motion | User asked to take the "where a user types" caret and make the whole site feel generated/typed. Applied to headings, prompts, and the contact email. |
| 2026-06-26 | Add Services section + proof/credibility + concrete process | Per feedback: site said "cool studio" more than what it builds. Added concrete services, `[live]` work with tech + outcomes, hero proof strip, and concrete process. Truthful proof only — no invented testimonials or metrics. |
| 2026-06-26 | Reintroduce gold (#b8860b / #7a5a0a) as the single accent over the ink/paper terminal | Per user direction. Keep the terminal style and IBM Plex Mono font; gold returns on cursors, prompts, the serif "crazy", `[live]` badges, `#` tags, step numbers, and primary CTAs. Ink stays primary. |
| 2026-06-26 | Drop per-step date/timeline labels (DAY 01 / WEEK 01 …) from process | Per user: no actual date timeline. Steps now read by phase name + `[n/4]` only. General speed claim kept in the hero proof strip. |
| 2026-06-26 | "Why we exist" body types out live, block by block | Per user. Added a `gate` prop to `<Typewriter>` to chain blocks (each starts when the previous finishes). |
| 2026-06-26 | Remove the grid-line background behind the contact section | Per user. Clean paper behind "// got a crazy idea?". |
| 2026-06-26 | Scope typing animation to the hero title + the "why we exist" section only | Per user. All other prompts/headings render statically. Underline "crazy" so the gold underline draws in with the typed characters. |
| 2026-06-26 | Remove the "how we work" / process section entirely | Per user. Deleted `HowItWorks.{jsx,css}` and the `./process` nav + footer links. Page flow is now hero → services → work → about → contact. |
