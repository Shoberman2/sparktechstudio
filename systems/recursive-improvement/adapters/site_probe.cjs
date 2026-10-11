// Generic site probe: uses a company's site like a visitor and reports reproducible findings.
// Trusted adapter kept outside the worker's editable workspace. Runs headless Chromium only.
//
// Input (RSEI_PROBE_TASK, JSON):
//   base_url   : probe an already running site (production or preview), or
//   serve      : {argv: [...], cwd?: string} started here with "{port}" replaced by a free port,
//                plus ready_path (default "/")
//   routes     : entry routes to visit (default ["/"])
//   viewports  : [{name, width, height}] (default desktop 1440x900 and mobile 390x844)
//   max_pages  : crawl limit for same-origin links discovered on the way (default 12)
//   ignore_console : regex strings for console noise that must not count as findings
//   known_fingerprints : fingerprints the caller is asking about (echoed back as "resolved"/"present")
//
// Output: RSEI_EVIDENCE/result.json with schema_version 2, screenshots per route and viewport.
// Exit 0 = no findings, 10 = findings observed, 2 = infrastructure error.
const { createRequire } = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');

const loader = process.env.RSEI_PLAYWRIGHT_MODULE
  ? createRequire(path.resolve(process.env.RSEI_PLAYWRIGHT_MODULE)) : require;
const { chromium } = process.env.RSEI_PLAYWRIGHT_MODULE
  ? loader(path.resolve(process.env.RSEI_PLAYWRIGHT_MODULE)) : require('playwright');

const SEVERITY = { pageerror: 'high', route_status: 'high', broken_link: 'high', console_error: 'medium',
  failed_request: 'medium', overflow: 'medium', missing_title: 'low', missing_description: 'low',
  h1_count: 'low', image_alt: 'low' };

function sha(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
function slug(s) { return (s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'root').slice(0, 60); }

async function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => { const p = srv.address().port; srv.close(() => resolve(p)); });
    srv.on('error', reject);
  });
}

async function waitReady(url, ms) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try { const r = await fetch(url); if (r.status < 500) return; } catch (_) {}
    await new Promise(r => setTimeout(r, 400));
  }
  throw new Error('Server did not become ready: ' + url);
}

(async () => {
  const evidence = process.env.RSEI_EVIDENCE;
  const workspace = process.env.RSEI_WORKSPACE;
  const task = JSON.parse(fs.readFileSync(process.env.RSEI_PROBE_TASK, 'utf8'));
  const viewports = task.viewports || [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }];
  const ignore = (task.ignore_console || []).map(s => new RegExp(s, 'i'));
  const maxPages = task.max_pages || 12;
  let server = null;
  let baseUrl = task.base_url;
  const serverLog = [];
  if (!baseUrl) {
    if (!task.serve || !Array.isArray(task.serve.argv)) throw new Error('Need base_url or serve.argv');
    const port = await freePort();
    const argv = task.serve.argv.map(a => a.replace('{port}', String(port)));
    // detached: the server gets its own process group so the whole tree (npx, vite, ...) can be killed at the end
    server = spawn(argv[0], argv.slice(1), { cwd: task.serve.cwd || workspace, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
    server.stdout.on('data', d => serverLog.push(d.toString()));
    server.stderr.on('data', d => serverLog.push(d.toString()));
    baseUrl = `http://127.0.0.1:${port}`;
    await waitReady(baseUrl + (task.serve.ready_path || '/'), task.serve.ready_ms || 60000);
  }
  const origin = new URL(baseUrl).origin;
  let browser;
  const findings = [];
  const pages = [];
  const artifacts = [];
  const seen = new Set();
  const queue = [...(task.routes || ['/'])];
  function add(kind, route, viewport, detail, extra = {}) {
    const normalized = String(detail).replace(origin, '').replace(/:\d{2,5}\b/g, '').replace(/\s+/g, ' ').trim().slice(0, 400);
    const fingerprint = sha(`${kind}|${route}|${viewport || ''}|${normalized}`);
    if (findings.some(f => f.fingerprint === fingerprint)) return;
    findings.push({ kind, severity: SEVERITY[kind] || 'medium', route, viewport: viewport || null, detail: normalized, fingerprint, ...extra });
  }
  try {
    browser = await chromium.launch({ headless: true });
    while (queue.length && seen.size < maxPages) {
      const route = queue.shift();
      if (seen.has(route)) continue;
      seen.add(route);
      for (const vp of viewports) {
        const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
        const page = await context.newPage();
        const consoleErrors = [];
        const pageErrors = [];
        const failed = [];
        page.on('pageerror', e => pageErrors.push(e.message));
        page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
        page.on('response', r => { const u = r.url(); if (u.startsWith(origin) && r.status() >= 400) failed.push(`${r.status()} ${u}`); });
        page.on('requestfailed', r => { const u = r.url(); if (u.startsWith(origin)) failed.push(`failed ${u} ${r.failure() && r.failure().errorText}`); });
        let status = null;
        try {
          const resp = await page.goto(origin + route, { waitUntil: 'load', timeout: 30000 });
          status = resp ? resp.status() : null;
          await page.waitForTimeout(800);
        } catch (e) {
          add('route_status', route, vp.name, 'navigation failed: ' + e.message);
          await context.close();
          continue;
        }
        if (status && status >= 400) add('route_status', route, vp.name, `HTTP ${status}`);
        const info = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href]')).map(a => a.getAttribute('href'));
          const imgs = Array.from(document.images).filter(i => !i.hasAttribute('alt')).map(i => i.getAttribute('src') || '').slice(0, 5);
          const desc = document.querySelector('meta[name="description"]');
          return {
            title: document.title, description: desc ? desc.getAttribute('content') : null,
            h1: document.querySelectorAll('h1').length, links, imgsWithoutAlt: imgs,
            overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
            scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth,
          };
        });
        const shot = `${slug(route)}.${vp.name}.png`;
        await page.screenshot({ path: path.join(evidence, shot), fullPage: false });
        artifacts.push(shot);
        pageErrors.forEach(e => add('pageerror', route, vp.name, e));
        consoleErrors.filter(t => !ignore.some(rx => rx.test(t))).forEach(t => add('console_error', route, vp.name, t));
        failed.forEach(f => add('failed_request', route, vp.name, f));
        if (vp === viewports[0]) {
          if (!info.title || !info.title.trim()) add('missing_title', route, null, 'document has no title');
          if (!info.description) add('missing_description', route, null, 'no meta description');
          if (info.h1 !== 1) add('h1_count', route, null, `page has ${info.h1} h1 elements`);
          if (info.imgsWithoutAlt.length) add('image_alt', route, null, 'images without alt: ' + info.imgsWithoutAlt.join(', '));
          for (const href of info.links) {
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
            let u; try { u = new URL(href, origin + route); } catch (_) { continue; }
            if (u.origin !== origin) continue;
            const p = u.pathname.replace(/\/$/, '') || '/';
            if (!seen.has(p) && !queue.includes(p)) queue.push(p);
          }
          pages.push({ route, status, title: info.title, h1: info.h1 });
        }
        if (vp.width < 600 && info.overflow) add('overflow', route, vp.name, `horizontal overflow: scrollWidth ${info.scrollWidth} > viewport ${info.innerWidth}`, { screenshot: shot });
        await context.close();
      }
    }
    const known = task.known_fingerprints || [];
    const present = new Set(findings.map(f => f.fingerprint));
    const result = {
      schema_version: 2, status: findings.length ? 'finding' : 'passed', base_url: baseUrl, origin,
      findings, pages, artifacts, engine: 'playwright-chromium',
      known: known.map(fp => ({ fingerprint: fp, state: present.has(fp) ? 'present' : 'resolved' })),
      limitation: 'Visitor-level observation: console, requests, status codes, structure and overflow. Not a functional test of product logic.',
    };
    fs.writeFileSync(path.join(evidence, 'result.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ status: result.status, findings: findings.length, pages: pages.length }));
    process.exitCode = findings.length ? 10 : 0;
  } finally {
    if (browser) await browser.close();
    if (server) { try { process.kill(-server.pid, 'SIGKILL'); } catch (_) { try { server.kill('SIGKILL'); } catch (_) {} } }
    if (serverLog.length) fs.writeFileSync(path.join(evidence, 'server.log'), serverLog.join('').slice(0, 200000));
  }
})().then(() => process.exit(process.exitCode || 0), err => { console.error(err); process.exit(2); });
