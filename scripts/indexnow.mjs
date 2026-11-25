// Tell Bing, Yandex, Seznam, Naver and the other IndexNow engines that the site changed, so new and updated pages are
// recrawled in hours instead of weeks. Bing's index feeds ChatGPT search and Copilot answers, so this matters for AEO.
// Run after a production deploy: `npm run indexnow` (reads the live sitemap, so it always sends the current pages).
// The key is public by design: Bing checks it by fetching {SITE}/bc647e3fd0f6824c63c02c8651970ad7.txt, which proves we own the site.
const SITE = 'https://www.sparktechstudio.com'
const KEY = 'bc647e3fd0f6824c63c02c8651970ad7'

const res0 = await fetch(`${SITE}/sitemap.xml`)
const sitemap = await res0.text()
if (!res0.ok || !sitemap.includes('<urlset')) throw new Error(`${SITE}/sitemap.xml answered ${res0.status} without a sitemap. Nothing sent.`)
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim()).filter(u => u.startsWith(SITE + '/'))
if (!urlList.length) throw new Error('The sitemap lists no pages on this site. Nothing sent.')
for (const extra of ['/llms.txt', '/llms-full.txt']) urlList.push(SITE + extra)
const proof = await fetch(`${SITE}/${KEY}.txt`)
if (!proof.ok || (await proof.text()).trim() !== KEY) throw new Error(`The key file ${SITE}/${KEY}.txt is not live yet. Deploy first.`)

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
})
// 200: received. 202: received, the key is still being checked. Anything 4xx: rejected (bad key, host or URLs).
const meaning = { 200: 'received', 202: 'received, key check pending' }[res.status] || 'not accepted'
console.log(`IndexNow: ${res.status} (${meaning}) for ${urlList.length} URLs`)
if (res.status >= 400) { console.error(await res.text()); process.exit(1) }
