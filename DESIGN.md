# Design System — SparkTech Studios

## Product Context
- **What this is:** A dev studio that builds ambitious, unconventional product ideas fast
- **Who it's for:** People with wild product ideas who can't afford a big agency and need more than DIY
- **Space/industry:** Creative development studio / software agency
- **Project type:** Marketing site (single-page, React + Vite)

## Aesthetic Direction
- **Direction:** Organic/Warm Workshop
- **Decoration level:** Intentional — grain texture overlay, subtle background tints per section, no decorative blobs or ornamental SVGs
- **Mood:** The warm creative workshop where things get built. Craft beer label energy, not enterprise agency polish. Approachable, confident, slightly irreverent.
- **Anti-patterns:** No purple gradients, no 3-column icon card grids, no centered-everything layouts, no decorative floating blobs, no generic hero copy

## Typography
- **Display/Hero:** Playfair Display (900/700) — distinctive serif with character, not precious. Used for section headings and the hero headline.
- **Body:** Space Grotesk (400/500/600) — geometric sans with personality. Readable at body sizes, interesting at display sizes.
- **UI/Labels:** Space Grotesk (600) — same as body, weight differentiation only
- **Data/Tables:** Space Mono (400) — monospace companion from the same family. Used for tags, labels, code snippets, numbered items.
- **Code:** Space Mono (400)
- **Loading:** Google Fonts CDN — `Playfair+Display:wght@400;700;900` and `Space+Grotesk:wght@400;500;600;700` and `Space+Mono:wght@400;700`
- **Scale:**
  - Hero: clamp(2.5rem, 5vw, 4rem)
  - Section heading: 1.5rem
  - Card heading: 1.25rem
  - Body: 1rem (20px base)
  - Small/labels: 0.85rem
  - Tags/mono: 0.75rem
  - Micro (uppercase labels): 11-12px, letter-spacing 0.1em

## Color
- **Approach:** Restrained — gold is the only accent. Everything else is warm neutrals. Color is rare and meaningful.
- **Background:** #fafaf7 — warm off-white, like craft paper
- **Surface:** #f0efe9 — secondary background for alternating sections
- **Card:** #ffffff — elevated surfaces
- **Text primary:** #1a1a1e — near-black
- **Text secondary:** #55555e — body copy, descriptions
- **Text muted:** #8a8a95 — labels, tags, placeholder text
- **Border subtle:** rgba(0, 0, 0, 0.06) — card borders, section dividers
- **Border light:** rgba(0, 0, 0, 0.12) — interactive borders, outline buttons
- **Accent:** #c9a200 — yellow-gold, used for gradients, hover states, emphasis
- **Accent dark:** #8a7000 — WCAG AA safe (4.57:1 on #fafaf7), used for text where gold appears on white
- **Gradient:** linear-gradient(135deg, #c9a200, #8a7000) — primary gradient for buttons, gradient text
- **Semantic:** success #2d7a4f, warning #b8860b, error #c0392b, info #2c6fbb
- **Dark mode strategy:** Invert surfaces (bg: #141413, surface: #1e1e1c, card: #252523), flip text to #f0efe9, bump accent slightly to #d4ad00 for visibility, reduce saturation 10-20% on semantics

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable
- **Scale:** 2xs(4) xs(8) sm(16) md(24) lg(32) xl(48) 2xl(64)
- **Section padding:** Varies intentionally — not every section gets the same padding. Alternate between 48px and 64px to break monotonous rhythm.

## Layout
- **Approach:** Hybrid — editorial asymmetry for hero and portfolio sections, grid-disciplined for process/pricing/form sections
- **Max content width:** 1120px
- **Border radius:** sm(4px) md(8px) lg(12px) full(9999px for pills/buttons)
- **Section alignment:** Alternate between left-aligned and centered sections to break AI-slop monotony
- **Breakpoints:** mobile(<768px) tablet(768-1024px) desktop(>1024px)

## Motion
- **Approach:** Intentional — meaningful transitions that aid comprehension
- **Scroll reveal:** IntersectionObserver + MutationObserver, threshold 0.15, translateY(40px) entrance
- **Hero:** word-rise animation with staggered delays (0.1s increments)
- **Easing:** enter(cubic-bezier(0.16, 1, 0.3, 1)) — fast start, gentle settle
- **Duration:** micro(100ms for hovers) short(200ms for state changes) medium(300ms for transitions) long(800ms for scroll reveals)
- **Hover states:** buttons lift 1px + gold box-shadow glow, cards get gold border + subtle shadow
- **Grain overlay:** Fixed position, opacity 0.025, fractalNoise SVG pattern
- **Reduced motion:** Respect `prefers-reduced-motion: reduce` — disable all animations, set opacity/transform to final state immediately

## Component Patterns
- **Buttons:** Pill-shaped (border-radius: 9999px). Three variants: primary (gold gradient + white text), secondary (surface bg), ghost (transparent + border)
- **Cards:** White bg, subtle border, 12px radius. Gold border + shadow on hover. Number prefix in mono font.
- **Tags:** Pill-shaped, surface bg, mono font, muted text color
- **Form inputs:** 8px radius, 1.5px border, gold border on focus. Full-width on mobile, 70% centered on tablet.
- **Alerts:** Left-border accent (3px), tinted background matching semantic color at 8% opacity

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-23 | Initial design system created | Created by /design-consultation based on existing codebase + competitive research |
| 2026-03-23 | Keep Playfair Display + Space Grotesk | Existing pairing works — distinctive without being precious |
| 2026-03-23 | Warm off-white over dark theme | Differentiator — every studio site is dark. Warm cream = craft, not corporate |
| 2026-03-23 | Darken accent-gold to #8a7000 | WCAG AA compliance — original #a68500 failed contrast (3.36:1) |
| 2026-03-23 | Remove accent-mint + gradient-accent | Unused third color diluted the gold identity |
| 2026-03-23 | Restrained color (gold-only accent) | One accent color = stronger identity. Color is rare and meaningful. |
| 2026-03-23 | Asymmetric layouts over card grids | 3-column icon card grid is AI slop pattern #1. Break the template. |
| 2026-03-23 | Grain texture overlay kept | Adds warmth and tactile quality. Reinforces "workshop" feel. |
