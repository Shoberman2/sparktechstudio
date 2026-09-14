# SparkTech operating studio redesign

Implemented in `src/studio/Studio.jsx` and `Studio.css`. Production homepage and
capability paths use this component; historical mockups and the legacy fallback
are retained and loaded separately. No deployment or operational integrations
were performed.

## Content decisions

- Lead: “Build it. Keep it moving.” Incubator, product creator, ongoing operator.
- Keep the approved Practice Notes cream/green/coral style and singular brand.
- Five planned workflows: quality/release, maintenance, product learning,
  social/content, and company operations. These are descriptions, not live agents.
- Interactive architecture diagram separates reusable systems from company data,
  credentials, brand, goals, and permissions. Connections are illustrative.
- UTern explicitly remains independent and is not owned by SparkTech.
- Existing source roster says `leed.media` / LEED; the verbal brief says LEAD.
  Retained the established name. No ownership or active-integration claim for
  LEED, Ballot Watch, or any other listed project.
- Existing project descriptions and outbound URLs are reused unchanged. Their
  live availability was not independently audited in this website redesign.
- Updated metadata, social card, and source guidance to match the new direction.

## Verification

- `npm run build`: pass.
- `npm run lint`: pass.
- `git diff --check`: pass.
- Browser widths 320, 375, 768, and 1440: no horizontal page overflow.
- Visually inspected desktop hero and architecture diagram, mobile homepage,
  mobile product-learning detail, and 1200×630 social image.
- Company selector changes the context panel and pressed state.
- Product-learning disclosure opens; its detail link loads the correct page.
- Maintenance disclosure opens from keyboard Enter on the focused summary.
- Existing `/capabilities/product-engineering` resolves to quality/release.
- Homepage local anchors resolve and logo images load.
- Fresh homepage and capability navigation: no console errors. A development HMR
  warning while editing the root entry was absent after a clean navigation.
- Fixed legacy global `nav` styling by loading legacy App assets only on its route.

## Preview

`npm run dev -- --host 127.0.0.1 --port 5173`

Local preview: http://127.0.0.1:5173/

Social-card source: `assets/social-card.html`; output: `public/og.png`.
No public deployment was requested or made.
