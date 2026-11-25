// Tell Bing, Yandex, Seznam, Naver and the other IndexNow engines that the site changed, so new and updated pages are
// recrawled in hours instead of weeks. Bing's index feeds ChatGPT search and Copilot answers, so this matters for AEO.
// Run after a production deploy: `npm run indexnow` (reads the live sitemap, so it always sends the current pages).
// The key is public by design: Bing checks it by fetching {SITE}/bc647e3fd0f6824c63c02c8651970ad7.txt, which proves we own the site.
const SITE = 'https://www.sparktechstudio.com'
const KEY = 'bc647e3fd0f6824c63c02c8651970ad7'

const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text()
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
for (const extra of ['/llms.txt', '/llms-full.txt']) urlList.push(SITE + extra)
const proof = await fetch(`${SITE}/${KEY}.txt`)
if (!proof.ok || (await proof.text()).trim() !== KEY) throw new Error(`The key file ${SITE}/${KEY}.txt is not live yet. Deploy first.`)

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
})
// 200 and 202 both mean accepted
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URLs`)
if (res.status >= 400) { console.error(await res.text()); process.exit(1) }
