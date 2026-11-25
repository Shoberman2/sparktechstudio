// Prerender every site route to static HTML after `vite build`, so crawlers and AI agents that do not run
// JavaScript still get the full page. The client hydrates the same tree (src/main.jsx).
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = resolve('dist')
const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href)
const { pageRoutes, homeMeta } = await import(pathToFileURL(resolve('dist-ssr/pages.js')).href)
const template = readFileSync(resolve(dist, 'index.html'), 'utf8')

const site = 'https://www.sparktechstudio.com'
const routes = [
  { path: '/', ...homeMeta },
  { path: '/grader', title: 'Free SEO and AEO Checker | SparkTech Studios', description: 'Check your website free. A score out of 100 and a plain-English fix list for speed, mobile, SEO, AI answers and broken links. No email needed.' },
  { path: '/services', title: 'Website, SEO and AI Agent Services | SparkTech Studios', description: 'Websites, SEO and AEO, AI agents and website updates for small businesses, plus AI apps, web apps and MVPs. A flat $500 a month.' },
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

// lastmod is the build date, so search engines and AI crawlers see when the site last changed (sitemap and WebPage)
const lastmod = new Date().toISOString().slice(0, 10)
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
  // The 404 page is noindex and has no address of its own, so it carries no canonical
  if (r.path === '/404') page = page.replace(/\s*<link rel="canonical"[^>]*>/, '')
  else page = page.replace(/(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => a + url + b)
  page = page.replace(/(<meta property="og:url" content=")[^"]*(")/, (_, a, b) => a + url + b)
  if (r.image) page = page.replace(/(<meta property="og:image" content=")[^"]*(")/, (_, a, b) => a + site + r.image + b)
  // One WebPage node per page (2026-11-24): ties the page to the site and the studio, and dates it, for search engines and AI tools
  if (!r.noindex) {
    const webPage = { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${url}#webpage`, url, name: r.title, description: r.description, isPartOf: { '@id': `${site}/#site` }, about: { '@id': `${site}/#org` }, inLanguage: 'en-US', dateModified: lastmod }
    page = page.replace('</head>', () => `  <script type="application/ld+json">${JSON.stringify(webPage).replace(/</g, '\\u003c')}</script>\n  </head>`)
  }
  if (r.noindex) page = page.replace(/(<meta name="robots" content=")[^"]*(")/, (_, a, b) => a + 'noindex' + b)
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
writeFileSync(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.filter(r => !r.noindex).map(r => `  <url><loc>${site}${r.path === '/' ? '/' : r.path}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`)
// llms-full.txt (2026-11-24): the text of every indexable page in one plain file, for AI tools that read a site in one
// fetch instead of crawling it. Built from the same prerendered HTML, so it can never say something the pages don't.
// The nav, footer, buttons, decorative pictures (aria-hidden) and scripts are left out.
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const SKIP = new Set(['header', 'footer', 'script', 'style', 'svg', 'button', 'noscript', 'form'])
const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
function toText(html) {
  const out = [], links = [], stack = []
  let skip = 0, li = 0
  const tag = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*?)(\/?)>|([^<]+)/g
  for (const m of html.replace(/<!--[\s\S]*?-->/g, '').matchAll(tag)) {
    const [, close, rawName, attrs = '', selfClose, text] = m
    if (text !== undefined) { if (!skip) out.push(decode(text).replace(/\s+/g, ' ')); continue }
    const name = rawName.toLowerCase()
    if (VOID.has(name) || selfClose) continue
    const heading = /^h[1-6]$/.test(name)
    if (!close) {
      const hide = SKIP.has(name) || /aria-hidden="true"/.test(attrs) || /class="[^"]*\b(skip|actions|band)\b/.test(attrs)
      stack.push(hide)
      if (hide) { skip++; continue }
      if (skip) continue
      // Inside a list item, a heading is the item's bold lead-in and its paragraph follows on the same line
      if (li && heading) out.push('**')
      else if (heading) out.push(`\n\n${'#'.repeat(Number(name[1]) + 1)} `)
      else if (name === 'summary') out.push('\n\n#### ')
      else if (name === 'li') { li++; out.push('\n- ') }
      else if (['p', 'section', 'div', 'details', 'ul', 'ol', 'main'].includes(name)) out.push(li ? ' ' : '\n\n')
      else if (name === 'a') { links.push([out.length, (attrs.match(/href="([^"]*)"/) || [])[1] || '']); out.push('') }
      continue
    }
    const hidden = stack.pop()
    if (hidden) { skip--; continue }
    if (skip) continue
    if (li && heading) out.push('**. ')
    else if (name === 'li') li--
    else if (name === 'a') {
      const [at, href] = links.pop() || []
      if (at === undefined) continue
      const label = out.splice(at).join('').replace(/\s+/g, ' ').trim()
      const url = href.startsWith('/') ? site + href : href
      if (!label || !/^https?:/.test(url) || url.startsWith(site + '/#')) out.push(label)
      else if (label.startsWith('**')) out.push(label.replace(/^\*\*(.+?)\*\*/, (_, t) => `**[${t}](${url})**`))
      else out.push(`[${label}](${url})`)
    }
  }
  return out.join('').replace(/\*\*\. \s*\n/g, '**\n').replace(/\.\*\*\. /g, '.** ').replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/ {2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}
const full = [`# SparkTech Studios: the full text of ${site}`, '', `> Every indexable page of the site as plain text, rebuilt on every release (${lastmod}). The short summary is ${site}/llms.txt.`]
for (const r of routes.filter(r => !r.noindex)) {
  const url = `${site}${r.path === '/' ? '/' : r.path}`
  full.push('', '---', '', `# ${r.title}`, '', `URL: ${url}`, '', toText(render(r.path)))
}
writeFileSync(resolve(dist, 'llms-full.txt'), full.join('\n') + '\n')
console.log('wrote llms-full.txt')

rmSync(resolve('dist-ssr'), { recursive: true, force: true })
