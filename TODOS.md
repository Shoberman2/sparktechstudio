# TODOS

From the 2026-10-27 rebuild (`.rebuild-plan.md`). None of these may be filled with invented clients, quotes or numbers.

- [ ] **Local proof for each location page** (`src/designs/pages.jsx`, `locations`): New York City, Manhattan, Brooklyn, Long Island, Nassau County, Suffolk County. Each needs a real client, partner or project there that can be named with permission. Until then each page shows a TODO box and is `noindex` and left out of the sitemap. When one is filled, remove its `todo` and set `noindex: false` in `pageRoutes`.
- [ ] **Case study results** (`src/designs/content.jsx`, `studies.*.results`): UTern, Leed, BallotWatch, Validate-s. Real numbers or a quote with permission. Each page shows a TODO in the Results row until then.
- [ ] **A professional-services case study** (`industry.todo`): one law, finance or medical client, with permission. `/industries/professional-services` shows a TODO until then.
- [ ] **Leed stack**: only Next.js was verifiable from the live site. Confirm the rest before adding it.
- [ ] **Calendly link** (`src/designs/content.jsx`, `CALENDLY_URL`): Spencer's SparkTech booking link. Every Book a call reads `BOOK`; until the URL is set they open an email with the subject "Book a call".
- [ ] **Confirm prices** (`pricing` in `content.jsx`, `pricingPage.todo` in `pages.jsx`): Spencer signs off on Launch Site, Care and Growth. Then delete `todo`, and /pricing drops noindex and joins the sitemap; add it to the nav then.
- [ ] **Founder photo and bio** (`src/designs/Form.jsx`, `#about`): a real photo and a bio in Spencer's words. No credentials or employers until he supplies them.

From the 2026-11-11 redesign (branch `redesign/studio-aggregator`). Same rule: real numbers only.

- [ ] **PAGESPEED_API_KEY** in Vercel env. Without it the checker's speed test is usually refused by Google and left out of the score.
- [ ] **RESEND_API_KEY** in Vercel env (also powers `api/contact.js`). Without it "Send me the report" falls back to an email link.
- [ ] **Report storage and auto-send** (`saveLead` in `api/grade.js`): requests are emailed to the studio and the report is sent by hand.
- [ ] **Calendly link** (`CALENDLY_URL` in `src/designs/content.jsx`).
- [ ] **Social links** (`SOCIALS` in `src/site/facts.js`), then add them as `sameAs` in the JSON-LD in `index.html`.
- [ ] **What $500 a month includes**: the site says build, maintenance and updates, no build fee. Service pages still describe things like "a CMS you can edit"; confirm or trim (`src/designs/pages.jsx`).
- [ ] **Old plan pages**: `/services/retainers` and the "Monthly care" footer link still exist, now showing the one $500 price. Decide whether to keep them.
- [ ] **AI agents**: off the home page and out of the nav for now. `/services/ai-agents` still exists and is linked from `/services`.
- [ ] **Oasis VRX**: the card uses a capture of the live homepage. `~/oasisVRX/oasisVRX-redesign-preview.mp4` is a client preview and is not used; use it only with their OK.
- [ ] **Traction stats** (`stat` in `src/data/projects.js`): only UTern has one ("About 3,000 users", from Spencer).
