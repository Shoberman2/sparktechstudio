// Title, description and share image for every route, in one place. The build-time prerender (scripts/prerender.mjs)
// writes these into each page's <head>; App sets document.title from the same table so the two never drift.
import { companies } from './content.jsx'

export const SITE = 'https://www.sparktechstudio.com'
export const BRAND = 'Sparktech Studios'

const pages = [
  { path: '/', title: `${BRAND} | NYC Product Studio for App & Web Development`, description: `${BRAND} is a New York product studio. We design and build custom web apps, mobile apps, and websites for startups and small businesses, then keep improving them.` },
  { path: '/services', title: `App & Web Development Services in NYC | ${BRAND}`, description: 'Custom web apps, mobile apps, and websites for startups and small businesses in New York City and Long Island. Fixed-scope builds and ongoing improvement.' },
  { path: '/systems', title: `How We Keep Software Improving | ${BRAND} NYC`, description: `${BRAND}' system for continuous product improvement: one loop, run on repeat, with people in charge of goals, budget, and limits.` },
  { path: '/privacy', title: `Privacy | ${BRAND}`, description: 'No analytics, no ads, no tracking. What this site does with what you send.' },
  { path: '/404', title: `Not here | ${BRAND}`, description: 'That page is not here. Back to the studio.', noindex: true },
]

// Every route the prerender writes, in sitemap order
export function routes() {
  const work = companies.map(c => ({ path: `/work/${c.slug}`, title: c.seo.title, description: c.seo.description, image: `/work/${c.slug}/og.jpg` }))
  return [pages[0], pages[1], ...work, ...pages.slice(2)]
}

export function meta(path) {
  return routes().find(r => r.path === path) || pages.find(r => r.path === '/404')
}

// Canonical form: www, no trailing slash (the home page is the bare origin with its slash)
export const canonical = path => (path === '/' ? `${SITE}/` : `${SITE}${path.replace(/\/+$/, '')}`)
