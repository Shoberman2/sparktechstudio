// The free website grader. The browser never touches the site being graded: it asks this function, and this function
// fetches the homepage, runs the checks and answers in plain English.
//
//   GET  /api/grade?url=example.com&part=page    reads the homepage (phone speed is not tested, founder 2026-11-21): HTTPS, mobile, title, description, H1, image alt text,
//                                                Open Graph, structured data, AI crawler access (robots.txt and llms.txt),
//                                                broken links, contact or call to action
//
// The full report is shown on the page; nothing is emailed or stored (founder, 2026-11-21: "just show the report on the website").
import { lookup } from 'node:dns/promises'
import net from 'node:net'

export const config = { maxDuration: 90 }

const UA = 'Mozilla/5.0 (compatible; WebsiteGrader/1.0)'
const MAX_HTML = 2_000_000
const MAX_LINKS = 30
const recent = new Map() // ip -> timestamps, best-effort per-instance rate limit

function tooMany(ip, limit) {
  const now = Date.now()
  const times = (recent.get(ip) || []).filter(t => now - t < 10 * 60 * 1000)
  times.push(now)
  recent.set(ip, times)
  return times.length > limit
}

/* ---------- Fetching other people's sites safely ---------- */

// Addresses this function must never call: loopback, private networks, link-local (cloud metadata), and the like
function isPrivate(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number)
    return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 100 && b >= 64 && b <= 127) || (a === 198 && (b === 18 || b === 19))
  }
  const v = ip.toLowerCase()
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isPrivate(mapped[1])
  return v === '::' || v === '::1' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe8') || v.startsWith('fe9') ||
    v.startsWith('fea') || v.startsWith('feb') || v.startsWith('ff') || v.startsWith('64:ff9b') || v.startsWith('::ffff:')
}

async function assertPublic(u) {
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('blocked')
  if (u.username || u.password) throw new Error('blocked')
  if (u.port && u.port !== '80' && u.port !== '443') throw new Error('blocked')
  const host = u.hostname.replace(/^\[|\]$/g, '')
  const addrs = net.isIP(host) ? [{ address: host }] : await lookup(host, { all: true })
  if (!addrs.length || addrs.some(a => isPrivate(a.address))) throw new Error('blocked')
}

// fetch that checks every hop of a redirect chain before following it
async function safeFetch(start, { method = 'GET', timeout = 10000 } = {}) {
  let url = new URL(start)
  const signal = AbortSignal.timeout(timeout)
  for (let hop = 0; hop < 6; hop++) {
    await assertPublic(url)
    const res = await fetch(url, { method, redirect: 'manual', signal, headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.9' } })
    const next = res.status >= 300 && res.status < 400 && res.headers.get('location')
    if (!next) return { res, url }
    res.body?.cancel().catch(() => {})
    url = new URL(next, url)
  }
  throw new Error('too many redirects')
}

async function readText(res) {
  const reader = res.body?.getReader()
  if (!reader) return ''
  const chunks = []
  let size = 0
  while (size < MAX_HTML) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value); size += value.length
  }
  reader.cancel().catch(() => {})
  return Buffer.concat(chunks).toString('utf8')
}

/* ---------- Reading the HTML (small and dependency-free on purpose) ---------- */

const decode = s => String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
const text = s => decode(String(s || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()

function attrs(tag) {
  const out = {}
  for (const m of tag.matchAll(/([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    const key = m[1].toLowerCase()
    if (!(key in out)) out[key] = decode(m[2] ?? m[3] ?? m[4] ?? '')
  }
  return out
}
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))].map(m => attrs(m[1]))
const blocks = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>([\\s\\S]*?)</${name}>`, 'gi'))].map(m => ({ a: attrs(m[1]), inner: m[2] }))

const CTA = /\b(contact|book|call|schedule|appointment|reserve|quote|estimate|get started|get in touch|sign up|buy|order|shop|donate|subscribe|start|try|demo|apply|request|join)\b/i
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

async function checkLinks(html, base) {
  const seen = new Set()
  for (const a of tags(html, 'a')) {
    const href = (a.href || '').trim()
    if (!href || /^(#|mailto:|tel:|sms:|javascript:|data:)/i.test(href)) continue
    let u
    try { u = new URL(href, base) } catch { continue }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') continue
    u.hash = ''
    if (u.href !== base.href) seen.add(u.href)
    if (seen.size >= MAX_LINKS) break
  }
  const list = [...seen]
  const broken = []
  let checked = 0
  const one = async href => {
    try {
      let { res } = await safeFetch(href, { method: 'HEAD', timeout: 7000 })
      // Plenty of servers refuse HEAD; ask again properly before calling a link broken
      if ([400, 403, 404, 405, 501].includes(res.status)) { res.body?.cancel().catch(() => {}); ({ res } = await safeFetch(href, { timeout: 7000 })) }
      res.body?.cancel().catch(() => {})
      checked++
      if (res.status === 404 || res.status === 410 || res.status >= 500) broken.push({ href, status: res.status })
    } catch (err) {
      // A domain that no longer exists is a broken link. A slow or guarded server is not; leave those out.
      if (err?.code === 'ENOTFOUND' || err?.cause?.code === 'ENOTFOUND') { checked++; broken.push({ href, status: 'no such site' }) }
    }
  }
  const queue = [...list]
  await Promise.all(Array.from({ length: 8 }, async () => { while (queue.length) await one(queue.shift()) }))
  return { checked, broken }
}

// The crawlers behind ChatGPT, Claude, Perplexity and Google's AI answers. A site that blocks them cannot be named by them.
const AI_BOTS = [['GPTBot', 'ChatGPT'], ['OAI-SearchBot', 'ChatGPT search'], ['ClaudeBot', 'Claude'], ['PerplexityBot', 'Perplexity'], ['Google-Extended', 'Google AI']]

async function checkAi(base) {
  const get = async path => {
    try { const { res } = await safeFetch(new URL(path, base).href, { timeout: 7000 }); if (res.status !== 200) { res.body?.cancel().catch(() => {}); return null } return await readText(res) } catch { return null }
  }
  const [robots, llms] = await Promise.all([get('/robots.txt'), get('/llms.txt')])
  // robots.txt groups: one or more User-agent lines, then the rules that apply to them
  const rules = {}
  let agents = [], inRules = false
  for (const raw of (robots && !/<html/i.test(robots) ? robots : '').split(/\r?\n/)) {
    const m = raw.replace(/#.*/, '').match(/^\s*([A-Za-z-]+)\s*:\s*(.*?)\s*$/)
    if (!m) continue
    const key = m[1].toLowerCase(), value = m[2]
    if (key === 'user-agent') { if (inRules) { agents = []; inRules = false } agents.push(value.toLowerCase()) }
    else if (key === 'disallow' || key === 'allow') { inRules = true; for (const a of agents) (rules[a] ||= []).push([key, value]) }
  }
  const shutOut = name => { const r = rules[name.toLowerCase()] || rules['*'] || []; return r.some(([k, v]) => k === 'disallow' && v === '/') && !r.some(([k, v]) => k === 'allow' && v === '/') }
  const blocked = AI_BOTS.filter(([bot]) => shutOut(bot)).map(([, who]) => who)
  const hasLlms = !!llms && !/<html/i.test(llms) && llms.trim().length > 20
  const llmsCheck = hasLlms
    ? { id: 'llms', earned: 1, title: 'You have an llms.txt file for AI tools', fix: '', detail: llms.trim().split(/\r?\n/)[0].slice(0, 120) }
    : { id: 'llms', earned: 0, title: 'There is no llms.txt file', fix: 'An llms.txt file is a short plain-text summary of your business at yoursite.com/llms.txt: what you do, your services and prices, and how to reach you. AI tools can read it to describe you correctly.', detail: '' }
  const aiCheck = !blocked.length
    ? { id: 'ai', earned: 1, title: 'AI tools like ChatGPT are allowed to read your site', fix: '', detail: '' }
    : { id: 'ai', earned: 1 - blocked.length / AI_BOTS.length, title: blocked.length === AI_BOTS.length ? 'Your site blocks AI tools' : `Your site blocks ${blocked.length} of ${AI_BOTS.length} AI tools`, fix: `Your robots.txt file tells ${[...new Set(blocked)].join(', ')} not to read your site, so they cannot recommend you when someone asks. Remove those rules unless you blocked them on purpose.`, detail: '' }
  return [aiCheck, llmsCheck]
}

async function gradePage(input) {
  let url, res, httpsWorks = true
  try { ({ res, url } = await safeFetch(`https://${input}`)) } catch (err) {
    if (err.message === 'blocked') throw err
    httpsWorks = false
    ;({ res, url } = await safeFetch(`http://${input}`))
  }
  if (res.status >= 400) { res.body?.cancel().catch(() => {}); throw new Error(`status ${res.status}`) }
  const html = (await readText(res)).replace(/<!--[\s\S]*?-->/g, '')
  if (!/<html|<body|<head/i.test(html)) throw new Error('not a web page')

  const out = []
  const add = (id, earned, title, fix = '', detail = '') => out.push({ id, earned, title, fix, detail })

  // HTTPS: the page loads securely, and the plain http address sends people to it
  if (url.protocol !== 'https:' || !httpsWorks) {
    add('https', 0, 'Your site does not load securely', 'Browsers warn visitors away from sites without HTTPS, and Google ranks them lower. Turn on an SSL certificate with your host. It is usually free.')
  } else {
    let forwards = true
    try { const plain = await safeFetch(`http://${url.host}`, { method: 'HEAD', timeout: 7000 }); plain.res.body?.cancel().catch(() => {}); forwards = plain.url.protocol === 'https:' } catch { forwards = true }
    if (forwards) add('https', 1, 'Your site loads securely')
    else add('https', 0.6, 'The old http address does not forward to the secure one', 'Anyone who types or follows an http link lands on an unprotected copy of your site. Ask your host to redirect http to https.')
  }

  // Mobile: the viewport tag phones need to size the page
  const viewport = tags(html, 'meta').find(m => (m.name || '').toLowerCase() === 'viewport')?.content || ''
  if (!/width\s*=\s*device-width/i.test(viewport)) add('mobile', 0, 'Your site is not set up for phones', 'The page is missing the setting that tells a phone to fit it to the screen, so visitors see a tiny desktop page. Add a viewport tag, or move to a mobile-ready theme.')
  else if (/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/i.test(viewport)) add('mobile', 0.7, 'Visitors cannot zoom in on a phone', 'Your page blocks pinch to zoom, which makes small text hard to read. Remove the zoom limit from the viewport tag.')
  else add('mobile', 1, 'Your site is set up for phones')

  // Title
  const title = text(blocks(html.replace(/<svg[\s\S]*?<\/svg>/gi, ''), 'title')[0]?.inner)
  if (!title) add('title', 0, 'Your page has no title', 'The title is the headline people see in Google and on the browser tab. Add one that says what you do and where.')
  else if (title.length > 65) add('title', 0.6, 'Your page title is too long', `It is ${title.length} characters, and Google cuts titles off at about 60. Put the important words first and trim the rest.`, title)
  else if (title.length < 15) add('title', 0.5, 'Your page title says very little', `"${title}" does not tell Google or a visitor what you do. Use what you offer and where, in under 60 characters.`, title)
  else add('title', 1, 'Your page title is a good length', '', title)

  // Meta description
  const desc = (tags(html, 'meta').find(m => (m.name || '').toLowerCase() === 'description')?.content || '').trim()
  if (!desc) add('description', 0, 'Your page has no search description', 'This is the two lines under your name in Google. Without it Google picks text at random. Write one or two sentences on what you do and why to choose you.')
  else if (desc.length < 50) add('description', 0.5, 'Your search description is too short', `It is ${desc.length} characters. Aim for 120 to 160, enough to say what you do and give a reason to click.`, desc)
  else if (desc.length > 170) add('description', 0.7, 'Your search description is too long', `It is ${desc.length} characters, and Google cuts it off at about 160. Move the key point to the front and trim.`, desc)
  else add('description', 1, 'Your search description is a good length', '', desc)

  // H1
  const h1s = blocks(html, 'h1').map(b => text(b.inner)).filter(Boolean)
  if (!h1s.length) add('h1', 0, 'Your homepage has no main heading', 'Search engines and AI tools read the main heading (the H1) to learn what a page is about. Add one clear line that says what you do.')
  else if (h1s.length > 1) add('h1', 0.6, `Your homepage has ${h1s.length} main headings`, 'A page should have one main heading (H1) so it is clear what the page is about. Keep the most important one and turn the others into smaller headings.', h1s.slice(0, 5).join(' | '))
  else add('h1', 1, 'Your homepage has one clear main heading', '', h1s[0])

  // Image alt text. An empty alt="" is a valid way to mark decoration, so only a missing attribute counts.
  // Tracking pixels live in <noscript> and are not pictures, so they are left out
  const imgs = tags(html.replace(/<noscript[\s\S]*?<\/noscript>/gi, ''), 'img')
  const missing = imgs.filter(i => !('alt' in i))
  if (!imgs.length || !missing.length) add('alt', 1, imgs.length ? 'Every image has a description' : 'No images to describe')
  else add('alt', 1 - missing.length / imgs.length, `${missing.length} of ${plural(imgs.length, 'image')} ${missing.length === 1 ? 'has' : 'have'} no description`, 'Image descriptions (alt text) are how Google and screen readers know what a picture shows. Add a short description to each one.', missing.slice(0, 10).map(i => i.src || i['data-src'] || '').filter(Boolean).join('\n'))

  // Open Graph
  const og = Object.fromEntries(tags(html, 'meta').filter(m => /^og:/i.test(m.property || m.name || '')).map(m => [(m.property || m.name).toLowerCase(), m.content]))
  const ogMissing = ['og:title', 'og:description', 'og:image'].filter(k => !og[k])
  if (!ogMissing.length) add('og', 1, 'Links to your site show a proper preview')
  else add('og', 1 - ogMissing.length / 3, ogMissing.length === 3 ? 'Links to your site look blank when shared' : 'Your share preview is incomplete', `When someone texts or posts your link, the preview comes from Open Graph tags. Yours is missing: ${ogMissing.map(k => k.slice(3)).join(', ')}.`)

  // Structured data
  const ld = blocks(html, 'script').filter(b => /ld\+json/i.test(b.a.type || ''))
  const types = [], nodes = []
  let bad = 0
  for (const b of ld) {
    try {
      const walk = n => { if (Array.isArray(n)) n.forEach(walk); else if (n && typeof n === 'object') { if (n['@type']) { types.push(...[n['@type']].flat()); nodes.push(n) } if (n['@graph']) walk(n['@graph']) } }
      walk(JSON.parse(b.inner))
    } catch { bad++ }
  }
  const microdata = /\bitemscope\b/i.test(html)
  if (types.length) add('schema', 1, 'Your site tells Google and AI tools what it is', '', [...new Set(types)].slice(0, 8).join(', '))
  else if (microdata) add('schema', 0.7, 'Your structured data is the older kind', 'Your site labels its details in an older format. Add JSON-LD with your business name, address, hours and services so Google and AI tools can quote them.')
  else if (bad) add('schema', 0.3, 'Your structured data is broken', 'There is structured data on the page, but it has an error and cannot be read. Fix it so Google and AI tools can use your business details.')
  else add('schema', 0, 'Google and AI tools cannot read your business details', 'Structured data is a label that spells out your business name, address, hours and services. It is how you get rich results on Google and get named in AI answers. Your homepage has none.')

  // AEO: who you are, as a fact an AI answer can quote. A business or organization entry with a name and a way to
  // reach or find it (url, phone, email or address).
  // A plain Service or Product is not the business itself, so only business-like types count (ProfessionalService and
  // the other schema.org *Service business types do). When several match, the most complete one is used.
  const ENTITY = /(Organization|Business|Corporation|Store|Restaurant|[A-Za-z]+Service|Practice|Agency|Physician|Dentist|Attorney|Hotel|Clinic|Hospital|School|Bakery|Cafe|Shop|Contractor|Salon|Spa)$/
  const REACH = ['url', 'telephone', 'email', 'address', 'sameAs']
  const entity = nodes.filter(n => [n['@type']].flat().some(t => ENTITY.test(String(t))) && n.name)
    .sort((x, y) => REACH.filter(k => y[k]).length - REACH.filter(k => x[k]).length)[0]
  const reach = entity && REACH.filter(k => entity[k])
  if (entity && reach.length >= 2) add('entity', 1, 'AI tools can tell exactly who you are', '', `${[entity['@type']].flat()[0]}: ${entity.name} (${reach.join(', ')})`)
  else if (entity) add('entity', 0.5, 'Your business details are thin', `Your structured data names ${entity.name} but gives little else. Add your website, phone, email and address (and social profiles as sameAs) so AI answers can quote the right facts and link to you.`)
  else add('entity', 0, 'AI tools cannot confirm who you are', 'Add an Organization or LocalBusiness entry to your structured data with your business name, website, phone, email and address. It is the fact sheet AI tools quote when they name a business.')

  // AEO: is there real text in the page itself? Most AI crawlers do not run JavaScript, so a page that only fills in
  // after scripts run looks empty to them.
  const body = blocks(html, 'body')[0]?.inner ?? html
  const words = text(body.replace(/<(script|style|svg|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ')).split(' ').filter(w => /[a-z]/i.test(w)).length
  if (words >= 150) add('text', 1, 'AI tools can read your page without running scripts', '', `${words} words in the page itself`)
  else if (words >= 50) add('text', 0.5, 'Most of your page needs JavaScript to appear', `Only ${words} words are in the page before scripts run, and most AI crawlers do not run scripts. Render your main content on the server, or prerender it, so AI tools can read what you do.`, `${words} words`)
  else add('text', 0, 'AI tools see an almost empty page', `There are only ${words} words in the page before JavaScript runs. Most AI crawlers do not run JavaScript, so to them your site says nothing. Render or prerender the main content.`, `${words} words`)

  // AEO: does the site answer the questions people ask AI? An FAQ (best with FAQPage data) or question-style headings.
  const faqData = types.some(t => /^(FAQPage|QAPage)$/i.test(String(t)))
  const questions = [...blocks(html, 'h2'), ...blocks(html, 'h3'), ...blocks(html, 'h4'), ...blocks(html, 'summary'), ...blocks(html, 'dt')].map(b => text(b.inner)).filter(t => /\?\s*$/.test(t)).length
  if (faqData || questions >= 3) add('faq', 1, 'Your page answers customer questions', '', faqData ? `FAQ structured data and ${plural(questions, 'question')}` : `${plural(questions, 'question')} on the page`)
  else if (questions) add('faq', 0.5, 'Add a few more answers to real questions', `People ask AI tools full questions, like "who does X near me" or "how much does X cost". Your page answers ${plural(questions, 'question')}. Add a short FAQ with the questions customers really ask, plus FAQPage structured data.`)
  else add('faq', 0, 'Your page answers no customer questions', 'AI answers are built from pages that answer questions directly. Add a short FAQ (cost, timing, area, how to start) with FAQPage structured data.')

  // AEO: are the AI tools people ask for recommendations allowed to read the site at all? Plus llms.txt.
  out.push(...await checkAi(url))

  // Broken links
  const links = await checkLinks(html, url)
  if (!links.checked) add('links', null, 'Links were not checked', '', 'No links could be tested.')
  else if (!links.broken.length) add('links', 1, `All ${plural(links.checked, 'link')} we tested work`)
  else add('links', Math.max(0, 1 - links.broken.length / Math.min(links.checked, 5)), `${plural(links.broken.length, 'link')} on your homepage ${links.broken.length === 1 ? 'is' : 'are'} broken`, 'A dead link sends a customer to an error page and tells Google the site is not looked after. Fix or remove each one.', links.broken.map(b => `${b.href} (${b.status})`).join('\n'))

  // Contact or call to action
  const anchors = blocks(html, 'a')
  const hasDirect = anchors.some(a => /^(tel:|mailto:|sms:)/i.test(a.a.href || ''))
  const hasForm = /<form\b/i.test(html)
  const hasWords = [...anchors, ...blocks(html, 'button')].some(b => CTA.test(text(b.inner)) || CTA.test(b.a['aria-label'] || ''))
  if ((hasDirect || hasForm) && hasWords) add('cta', 1, 'Visitors have a clear way to reach you')
  else if (hasDirect || hasForm || hasWords) add('cta', 0.6, 'Your next step could be clearer', hasWords ? 'There is a button, but no phone number, email or form on the homepage. Add a direct way to reach you.' : 'There is a way to reach you, but no button that says what to do next. Add one clear button, like "Book a call" or "Get a quote", near the top.')
  else add('cta', 0, 'There is no clear way to contact you', 'A visitor who is ready to buy has nowhere to go. Add one clear button near the top, plus a phone number, an email or a form.')

  return { url: url.href, checks: out }
}

// Accepts "example.com", "www.example.com/page" or a full address, and returns host plus path with no scheme
function cleanInput(raw) {
  const s = String(raw || '').trim().replace(/^https?:\/\//i, '').replace(/\s+/g, '')
  if (!s || s.length > 300) return null
  try {
    const u = new URL(`https://${s}`)
    if (!u.hostname.includes('.') || u.username || u.password) return null
    return `${u.host}${u.pathname === '/' ? '' : u.pathname}${u.search}`
  } catch { return null }
}

export default async function handler(req, res) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'GET only' })
  }
  res.setHeader('Cache-Control', 'no-store')
  const input = cleanInput(req.query?.url)
  if (!input) return res.status(400).json({ ok: false, error: 'Enter a website address, like yourbusiness.com' })
  // Each grade is one call, so 12 calls is 12 sites every ten minutes
  if (tooMany(ip, 12)) return res.status(429).json({ ok: false, error: 'That is a lot of sites. Try again in a few minutes.' })

  try {
    const page = await gradePage(input)
    return res.status(200).json({ ok: true, ...page })
  } catch (err) {
    const msg = String(err?.message || err)
    console.error('grade failed', input, msg)
    if (msg === 'blocked') return res.status(400).json({ ok: false, error: 'We can only grade public websites.' })
    if (/^status /.test(msg)) return res.status(422).json({ ok: false, error: `That site answered with an error (${msg.slice(7)}). Check the address and try again.` })
    if (msg === 'not a web page') return res.status(422).json({ ok: false, error: 'That address did not return a web page.' })
    return res.status(422).json({ ok: false, error: 'We could not reach that site. Check the address and try again.' })
  }
}
