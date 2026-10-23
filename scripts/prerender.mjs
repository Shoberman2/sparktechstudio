// Prerender every site route to static HTML after `vite build`, so crawlers and AI agents that do not run
// JavaScript still get the full page. The client hydrates the same tree (src/main.jsx).
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = resolve('dist')
const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
const { routes, canonical, jsonld, SITE: site } = await import(pathToFileURL(resolve('dist-ssr/seo.js')).href)
const template = readFileSync(resolve(dist, 'index.html'), 'utf8')

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
for (const r of routes()) {
  const html = render(r.path)
  let page = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
  page = page.replace(/<title>[^<]*<\/title>/, `<title>${esc(r.title)}</title>`)
  page = page.replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(r.description)}$2`)
  page = page.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(r.title)}$2`)
  page = page.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(r.description)}$2`)
  const url = canonical(r.path)
  page = page.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
  page = page.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
  if (r.image) page = page.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${site}${r.image}$2`)
  // One JSON-LD @graph per page; '<' is escaped so the JSON can never close the script tag
  const ld = JSON.stringify(jsonld(r.path)).replace(/</g, '\\u003c')
  page = page.replace(/(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/, (_, open, close) => open + ld + close)
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
writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes().filter(r => !r.noindex).map(r => `  <url><loc>${canonical(r.path)}</loc></url>`).join('\n')}\n</urlset>\n`)
rmSync(resolve('dist-ssr'), { recursive: true, force: true })
