# Design System — SparkTech Studios

## Product Context
- **What this is:** A dev studio that builds ambitious, unconventional product ideas fast
- **Who it's for:** People with wild product ideas who can't afford a big agency and need more than DIY
- **Space/industry:** Creative development studio / software agency
- **Project type:** Marketing site (single-page, React + Vite)

## Aesthetic Direction
- **Direction:** Terminal / old-classical computing. The whole page reads like a console session being generated live.
- **Decoration level:** Intentional — CRT scanline overlay + paper grain, monochrome terminal window chrome (title bars, traffic-light dots, prompts), ASCII tree structures. No rounded cards, no gradients, no decorative blobs.
- **The one exception:** the hero is a dark surface (`#0a0907`) — the only one on the site. Its visual is a **terminal printing itself out**, not an image or a video: a fast session streams down the right side while the pitch sits clean on the left, landing on the payoff line **"AI is here."** No photography anywhere on the site.
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
- **Hero (dark surface only):** scoped to `.hero` and never used elsewhere. Bed `#0a0907`, text `--hero-fg` #f3f0e7 / `--hero-fg-soft` rgba(243,240,231,0.74), and `--hero-gold` **#d9a520** — a lifted gold, because the paper-safe `--accent-gold` (#7a5a0a) is unreadable on black. Hairlines rgba(243,240,231,0.28).
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
- **Page framing:** the fixed navbar is the window title bar (traffic-light dots + `sparktech-studios` + blinking caret); the footer ends in a perpetual live `spark@studio:~$ █` prompt. The navbar is **hidden on the first view** and snaps down past 80px of scroll, so the hero image is uninterrupted and edge-to-edge.
- **Page flow:** hero → thesis → why we exist → how we work → work → contact.

## Motion
- **Hero session:** the background stream prints one line every 52ms — fast and dramatic on purpose — then the headline types "AI is here." over it. Lines appear whole, not char-by-char: real command output prints by the line, and typing it out character-wise reads as fake. The *headline* types character by character, because that is a person typing, not output. Reduced motion renders all lines immediately.
- **Stream legibility:** the stream is held clear of the pitch column (`left: 58%`) rather than dimmed under a scrim, because a scrim would be a gradient. On mobile there is no room for a side column, so it runs full-bleed at 0.07 alpha — texture, not text. Only the oversized headline crosses it.
- **Signature:** Typewriter. The `<Typewriter>` component types text char-by-char once it scrolls into view, with a blinking gold caret. **Scoped to the hero headline only** — the gold underline on "Talent" draws in as it types. Every other section renders its prompt, heading, and body statically. Body copy is never typed: it delays reading for no gain. All other sections render their prompts and `// headings` statically. Ambient (non-typing) blinking carets remain in the navbar, the contact `$ mail` line, and the footer. Honors `prefers-reduced-motion` (renders full text, static caret).
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
| 2026-07-17 | Speed up "why we exist" typing (quote 15→7 ms/char, body blocks 12→5) | Per user. At the old pace the chained blocks left the section looking half-blank for ~12s to anyone scrolling at normal speed. |
| 2026-07-17 | Mobile (<600px): work-card names ellipsize + hover arrow hidden; contact `$ mail` line wraps; navbar wordmark shortens to `sparktech` + caret (<460px) | Longest domain (`spacialhealth.com`) forced 398px page width at 375px viewport, the email rendered cut off, and the full wordmark ran under the nav CTA. Terminal-authentic fix: shrink/wrap, don't clip. |
| 2026-07-17 | Social share card (`public/og.png`, 1200×630) in the paper-terminal style | Meta/OG tags added to `index.html`; card reuses the terminal bar, prompt, typed headline with gold caret, and scanlines. Canonical domain: www.sparktechstudio.com. |
| 2026-07-24 | **Concept pivot: "AI builds it. Talent scales it."** | Per user. The site led with "we build crazy ideas," which AI has made cheap. New lead is the scaling thesis: building is solved, scaling takes AI *and* senior talent. Crazy-ideas DNA stays (contact heading, mission) but no longer carries the hero. |
| 2026-07-24 | Full-bleed dark hero image (macro transistor) | Per user. First dark surface and first photographic element on the site; framed by a terminal title strip so it reads as a file open in the console. Warm amber/gold was prompted deliberately so it lands on the existing gold accent instead of fighting it. |
| 2026-07-24 | Brand goes singular: **SparkTech Studio** | Per user, matching sparktechstudio.com. Applied to the wordmark, tree root, page title, OG tags, and the about-section sign-off. The footer copyright stays "SparkTech Studios, LLC" — that is the registered entity, not a typo. |
| 2026-07-24 | Regenerate `public/og.png`; delete `Typewriter.jsx`; `AGENTS.md` becomes a pointer | Loose-end sweep. The share card had the old `spark@studio` prompt and pre-pivot copy baked into the pixels, so it was re-rendered from HTML at 1200×630 (and `og:image` gained `?v=2`, since social caches key on the URL). `Typewriter.jsx` was dead once the hero stopped typing, and held the repo's only 2 lint errors — now zero. `AGENTS.md` was a byte-identical copy of the pre-pivot `CLAUDE.md` that had silently gone stale; it is a pointer now so it cannot drift again. |
| 2026-07-24 | "AI is here." shows immediately instead of typing | Per user. Nothing on the site types now; the blinking caret stays as an ambient live-prompt mark. |
| 2026-07-24 | Hero background is a terminal printing itself out, ending on "AI is here." | Per user: "dramatic and fast." Same build-it-in-markup reasoning as below. Held clear of the pitch column (`left: 58%`) rather than scrimmed, since a scrim is a gradient and those are out. |
| 2026-07-24 | **Tried black-and-white site-wide, reverted.** Warm paper + gold stands. | Per user, who asked for it and then called the result awful on sight. The flip itself was clean (one `:root` token swap repainted everything), so this is a taste verdict on monochrome, not a technical failure. **Do not propose a B&W repaint again.** Kept: the hero stream. Reverted: palette, scanline/vignette colours, the four `color: var(--paper)` contrast fixes the white accent required, and the white-logo filter. |
| 2026-07-24 | Remove the radial glow behind the hero | Per user: "take away the gradient, I don't like that." Gradients are out generally; the scanline overlay stays. |
| 2026-07-24 | **Hero is a live terminal session**, built in React, not a video | Per user. Replaces the transistor still entirely (`transistor.jpg` deleted; nothing on the site is photographic now). Built in markup rather than generated with Veo because generated video renders text as garbled pseudo-glyphs, and a real terminal gives crisp type at any DPI for ~0KB instead of megabytes. The session content dramatizes the thesis: 20 agents, 4,312 lines generated, 4,312 reviewed. |
| 2026-07-24 | Prompt user is `sparktech@studio`, not `spark@studio` | Per user: the brand is SparkTech, and truncating it to "Spark" misread as a different name. Applied across all seven components. Note `public/og.png` still has the old prompt baked into the image. |
| 2026-07-24 | Thesis + why-we-exist go single-column, heading above body | Per user: the scroll "looks weird, especially how it's separated." Both sections used a two-column layout with a `position: sticky` heading, so the heading pinned while the body scrolled past, leaving a tall empty column. Every other section already put its heading above its content; these two were the outliers. |
| 2026-07-24 | Remove the `who-does-what.sh` ai/us split panel | Per user. The capability line it carried survives as a one-line footnote in the thesis. |
| 2026-07-24 | Drop the hero title strip entirely (`transistor.jpg` / `[ still ]`) | Per user. With the navbar already hidden, the strip was the last thing breaking the image's top edge. Removed the whole bar rather than just the two labels — three traffic-light dots alone in an empty bar reads as unfinished. Hero now has zero chrome. |
| 2026-07-24 | Restore "why we exist"; add a new terminal-styled "how we work" | Per user. `Beliefs.{jsx,css}` restored verbatim from git. The old `HowItWorks` was pre-terminal (Title Case, timeline rail with numbered circles) and could not be restored as-is, so `Process.{jsx,css}` is new: four square panels `[n/4] scope/build/harden/ship` in one bordered terminal window. Its copy is tied to the AI+talent thesis (step 2 names the split explicitly) rather than being generic agency process. |
| 2026-07-24 | **Typing scoped to the hero headline only** | Per user ("dont do the typing animation for the thesis"). Body copy is no longer typed anywhere — the chained `gate` sequencing left long sections half-blank while reading. Sections now use the standard `.reveal` fade instead. `<Typewriter>` is still used by the hero and the ambient carets remain. |
| 2026-07-24 | Navbar hidden on the first view, appears after 80px of scroll | Per user: the paper nav strip sitting on the dark hero "makes the page look funny." Hiding it gives the hero a clean full-bleed top edge. Uses `visibility` alongside the transform so hidden links stay out of the tab order, and the hero title strip moved to `top: 0` to fill the space the nav vacated. Tradeoff noted: no wordmark on the first screen. |
| 2026-07-24 | **Hero is a still, not video.** `transistor.mp4` removed | Tried a looping Veo 3.1 clip (macro zoom into the chip, boomerang-encoded to hide the loop cut). User cut it after seeing it live. The single frame carries the same image at 44KB instead of 2.3MB, with no autoplay, no loop seam, and nothing to degrade on mobile or reduced motion. Do not reintroduce a video hero without asking. |
| 2026-07-24 | Cut the 6-card services grid and the "why we exist" section; page is now hero → thesis → work → contact | Per user ("way more simple"). Page height dropped ~30%. The services content compressed into one `who-does-what.sh` panel (ai/ vs us/ ASCII columns), which now *argues the thesis* instead of listing capabilities. Nav drops to two links. |
| 2026-07-24 | Lifted hero gold to #d9a520, scoped to `.hero` | The paper-safe accent (#7a5a0a, chosen for AA on cream) is nearly invisible on near-black. The hero needs its own gold; the rest of the site is unchanged. |
