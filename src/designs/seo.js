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

/* ---------- Structured data: one JSON-LD @graph per page ---------- */

// TODO(Spencer): LinkedIn company URL, X/Twitter, GitHub, Clutch or Dribbble if any. Empty entries are left out of the rendered JSON.
export const SAME_AS = ['', '', '', '']

const ORG = `${SITE}/#org`
const area = [{ '@type': 'City', name: 'New York' }, { '@type': 'Place', name: 'Long Island, NY' }]

function siteGraph() {
  const sameAs = SAME_AS.filter(u => /^https?:\/\//.test(u))
  return [
    {
      '@type': ['Organization', 'ProfessionalService'],
      '@id': ORG,
      name: BRAND,
      legalName: `${BRAND}, Inc.`,
      alternateName: ['Sparktech Studios NYC', 'SparkTech Studio'],
      url: `${SITE}/`,
      logo: `${SITE}/logo.png`,
      image: `${SITE}/og.png`,
      email: 'contactus@sparktechstudio.com',
      description: 'New York product studio for custom app and web development for startups and small businesses.',
      founder: { '@type': 'Person', name: 'Spencer Hoberman' },
      address: { '@type': 'PostalAddress', addressLocality: 'New York', addressRegion: 'NY', addressCountry: 'US' },
      areaServed: area,
      ...(sameAs.length ? { sameAs } : {}),
      slogan: 'We build the things other people only talk about.',
    },
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: BRAND, publisher: { '@id': ORG } },
  ]
}

export const services = [
  ['Web app development', 'Customer portals, dashboards, booking and ordering systems, and internal tools.'],
  ['Mobile app development', 'iOS and Android apps, from MVP to App Store launch.'],
  ['Small business websites', 'Fast, search-friendly websites with booking, ordering, and contact flows built in.'],
  ['AI features', 'Assistants, search, and automation built into a product.'],
  ['Ongoing product improvement', 'Measuring and shipping improvements after launch.'],
]

const crumbs = items => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: canonical(path) })),
})

export function jsonld(path) {
  const graph = siteGraph()
  if (path === '/services') {
    graph.push({
      '@type': 'OfferCatalog',
      '@id': `${SITE}/services#catalog`,
      name: 'App and web development services',
      url: canonical('/services'),
      itemListElement: services.map(([name, description]) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name, serviceType: name, description, provider: { '@id': ORG }, areaServed: area },
      })),
    })
    graph.push(crumbs([['Home', '/'], ['Services', '/services']]))
  }
  const c = path.startsWith('/work/') && companies.find(x => `/work/${x.slug}` === path)
  if (c) {
    graph.push({
      '@type': 'CreativeWork',
      '@id': `${canonical(path)}#work`,
      name: c.name,
      description: c.seo.description,
      url: canonical(path),
      image: `${SITE}/work/${c.slug}/og.jpg`,
      creator: { '@id': ORG },
      ...(c.partner ? { contributor: { '@type': 'Organization', name: c.partner.name, url: c.partner.url } } : {}),
    })
    graph.push(crumbs([['Home', '/'], ['Work', '/#work'], [c.name, path]]))
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}
