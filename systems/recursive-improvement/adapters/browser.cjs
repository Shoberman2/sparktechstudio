// Trusted adapter, kept outside the worker's editable workspace.
// Uses a fresh browser context, no imported cookies, and blocks non-loopback traffic.
const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const loader = process.env.RSEI_PLAYWRIGHT_MODULE
  ? createRequire(path.resolve(process.env.RSEI_PLAYWRIGHT_MODULE)) : require;
const { chromium } = process.env.RSEI_PLAYWRIGHT_MODULE
  ? loader(path.resolve(process.env.RSEI_PLAYWRIGHT_MODULE)) : require('playwright');

(async () => {
  const workspace = process.env.RSEI_WORKSPACE;
  const evidence = process.env.RSEI_EVIDENCE;
  const html = fs.readFileSync(path.join(workspace, 'index.html'));
  const server = http.createServer((req, res) => {
    if (req.url !== '/') { res.writeHead(404); return res.end(); }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'");
    res.end(html);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({headless: true});
    const context = await browser.newContext();
    const origin = `http://127.0.0.1:${server.address().port}`;
    await context.route('**/*', route => new URL(route.request().url()).origin === origin
      ? route.continue() : route.abort());
    await context.tracing.start({screenshots: true, snapshots: true});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(origin, {waitUntil: 'load'});
    await page.locator('#increment').click({timeout: 5000});
    const actual = await page.locator('#count').textContent();
    await page.screenshot({path: path.join(evidence, 'page.png')});
    await context.tracing.stop({path: path.join(evidence, 'trace.zip')});
    const passed = actual === '1' && errors.length === 0;
    const result = {
      schema_version: 1, status: passed ? 'passed' : 'finding',
      fingerprint: passed ? null : crypto.createHash('sha256').update(`counter-one-click:${actual}:${JSON.stringify(errors)}`).digest('hex'),
      expected: '1', actual, errors,
      steps: ['Open isolated loopback fixture', 'Click Add one once', 'Read counter'],
      source_sha256: crypto.createHash('sha256').update(html).digest('hex'),
      artifacts: ['page.png', 'trace.zip'], engine: 'playwright-chromium'
    };
    fs.writeFileSync(path.join(evidence, 'result.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
    process.exitCode = passed ? 0 : 10; // 10 means observed finding; other failures are infrastructure errors.
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(err => { console.error(err); process.exitCode = 2; });
