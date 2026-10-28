// Prerender every site route to static HTML after `vite build`, so crawlers and AI agents that do not run
// JavaScript still get the full page. The client hydrates the same tree (src/main.jsx).
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = resolve('dist')
const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
const { companies } = await import(pathToFileURL(resolve('dist-ssr/content.js')).href).catch(() => ({ companies: null }))
const { pageRoutes } = await import(pathToFileURL(resolve('dist-ssr/pages.js')).href)
const template = readFileSync(resolve(dist, 'index.html'), 'utf8')

const site = 'https://www.sparktechstudio.com'
const routes = [
  { path: '/', title: 'SparkTech Studio | AI Web Apps, MVPs and Websites in New York', description: 'An independent studio in New York, NY. We build AI web apps and MVPs, and websites for law, finance and medical firms. Book a call.' },
  { path: '/work', title: 'Work | SparkTech Studio', description: 'Case studies: UTern, Leed, BallotWatch and Validate-s. The problem, what we built, and what it runs on.' },
  { path: '/services', title: 'Services | SparkTech Studio', description: 'AI app development, web apps, website design, startup MVPs and retainers, from an independent studio in New York.' },
  ...pageRoutes,
]
for (const c of companies || []) {
  const lede = String(c.lede || '').replace(/\s+/g, ' ')
  routes.push({ path: `/work/${c.slug}`, title: `${c.name} | SparkTech Studio`, description: `${c.line} ${lede}`.slice(0, 155).replace(/\s\S*$/, '') + (lede.length > 120 ? '.' : ''), image: `/work/${c.slug}/og.jpg` })
}
routes.push({ path: '/systems', title: 'System | SparkTech Studio', description: 'Software that keeps getting better. One loop, run on repeat, with people in charge of the goals, the budget, and the limits.' })
routes.push({ path: '/privacy', title: 'Privacy | SparkTech Studio', description: 'No analytics, no ads, no tracking. What this site does with what you send.' })
routes.push({ path: '/404', title: 'Not here | SparkTech Studio', description: 'That page is not here. Back to the studio.', noindex: true })

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
for (const r of routes) {
  const html = render(r.path)
  let page = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
  page = page.replace(/<title>[^<]*<\/title>/, `<title>${esc(r.title)}</title>`)
  page = page.replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(r.description)}$2`)
  page = page.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(r.title)}$2`)
  page = page.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(r.description)}$2`)
  const url = `${site}${r.path === '/' ? '/' : r.path}`
  page = page.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
  page = page.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
  if (r.image) page = page.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${site}${r.image}$2`)
  if (r.noindex) page = page.replace('</head>', '  <meta name="robots" content="noindex" />\n  </head>')
  if (r.path === '/') writeFileSync(resolve(dist, 'index.html'), page)
  else if (r.path === '/404') writeFileSync(resolve(dist, '404.html'), page)
  else {
    // Both shapes: work/<slug>.html for Vercel's cleanUrls, work/<slug>/index.html for any plain static host
    mkdirSync(resolve(dist, r.path.slice(1)), { recursive: true })
    writeFileSync(resolve(dist, r.path.slice(1), 'index.html'), page)
    writeFileSync(resolve(dist, `${r.path.slice(1)}.html`), page)
  }
  console.log('prerendered', r.path)
}

// sitemap from the same route list
writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.filter(r => !r.noindex).map(r => `  <url><loc>${site}${r.path === '/' ? '/' : r.path}</loc></url>`).join('\n')}\n</urlset>\n`)
rmSync(resolve('dist-ssr'), { recursive: true, force: true })
