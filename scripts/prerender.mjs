// Prerender every site route to static HTML after `vite build`, so crawlers and AI agents that do not run
// JavaScript still get the full page. The client hydrates the same tree (src/main.jsx).
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = resolve('dist')
const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
const { pageRoutes } = await import(pathToFileURL(resolve('dist-ssr/pages.js')).href)
const template = readFileSync(resolve(dist, 'index.html'), 'utf8')

const site = 'https://www.sparktechstudio.com'
const routes = [
  { path: '/', title: 'SparkTech Studios', description: 'We design, build and run small business websites for $500 a month and get them found on Google and in AI answers like ChatGPT.' },
  { path: '/grader', title: 'Free SEO and AEO Checker | SparkTech Studios', description: 'Check your website free. A score out of 100 and a plain-English fix list for speed, mobile, SEO, AI answers and broken links. No email needed.' },
  { path: '/services', title: 'Services | SparkTech Studios', description: 'Websites, AI agents, website updates, and SEO and AEO for businesses, plus AI apps, web apps and MVPs.' },
  ...pageRoutes,
]
// No /work pages: the site names no products or companies (Spencer, 2026-11-18). vercel.json sends the old URLs home.
routes.push({ path: '/systems', title: 'System | SparkTech Studios', description: 'Software that keeps getting better. One loop, run on repeat, with people in charge of the goals, the budget, and the limits.' })
routes.push({ path: '/privacy', title: 'Privacy | SparkTech Studios', description: 'No ads and no tracking cookies. What this site counts, and what it does with what you send.' })
routes.push({ path: '/terms', title: 'Terms | SparkTech Studios', description: 'The ground rules for using the SparkTech Studios website. Project work is covered by its own written scope.' })
routes.push({ path: '/404', title: 'Not here | SparkTech Studios', description: 'That page is not here. Back to the studio.', noindex: true })

// Search results cut titles off around 60 characters, so the build fails rather than ship a longer one
const long = routes.filter(r => r.title.length > 60)
if (long.length) throw new Error(`Titles over 60 characters:\n${long.map(r => `  ${r.title.length} ${r.path}: ${r.title}`).join('\n')}`)

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
for (const r of routes) {
  const html = render(r.path)
  let page = template.replace('<div id="root"></div>', () => `<div id="root">${html}</div>`)
  page = page.replace(/<title>[^<]*<\/title>/, () => `<title>${esc(r.title)}</title>`)
  page = page.replace(/(<meta name="description" content=")[^"]*(")/, (_, a, b) => a + esc(r.description) + b)
  page = page.replace(/(<meta property="og:title" content=")[^"]*(")/, (_, a, b) => a + esc(r.title) + b)
  page = page.replace(/(<meta property="og:description" content=")[^"]*(")/, (_, a, b) => a + esc(r.description) + b)
  page = page.replace(/(<meta name="twitter:title" content=")[^"]*(")/, (_, a, b) => a + esc(r.title) + b)
  page = page.replace(/(<meta name="twitter:description" content=")[^"]*(")/, (_, a, b) => a + esc(r.description) + b)
  const url = `${site}${r.path === '/' ? '/' : r.path}`
  page = page.replace(/(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => a + url + b)
  page = page.replace(/(<meta property="og:url" content=")[^"]*(")/, (_, a, b) => a + url + b)
  if (r.image) page = page.replace(/(<meta property="og:image" content=")[^"]*(")/, (_, a, b) => a + site + r.image + b)
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
// lastmod is the build date, so search engines and AI crawlers see when the site last changed
const lastmod = new Date().toISOString().slice(0, 10)
writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.filter(r => !r.noindex).map(r => `  <url><loc>${site}${r.path === '/' ? '/' : r.path}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`)
rmSync(resolve('dist-ssr'), { recursive: true, force: true })
