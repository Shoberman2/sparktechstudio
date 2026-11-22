import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The deployed HTML carries the commit it was built from, so the improvement loop
// can confirm production actually picked up a change before re-checking it.
function buildCommit() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA
  try { return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch { return 'unknown' }
}

const buildMarker = () => ({
  name: 'sparktech-build-marker',
  transformIndexHtml(html) {
    return html.replace('</head>', `  <meta name="sparktech-build" content="${buildCommit()}">\n  </head>`)
  },
})

// Local dev only: serve the checker's API (api/grade.js) from the Vite server, so /grader works end to end without
// `vercel dev`. It adapts Node's req/res to the small part of Vercel's helpers the function uses. Not used in builds.
const devApi = () => ({
  name: 'sparktech-dev-api',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/api/grade', async (req, res) => {
      try {
        const url = new URL(req.originalUrl || req.url, 'http://localhost')
        let body = ''
        for await (const chunk of req) body += chunk
        req.query = Object.fromEntries(url.searchParams)
        req.body = body ? JSON.parse(body) : {}
        res.status = code => { res.statusCode = code; return res }
        res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); return res }
        res.send = data => { res.end(typeof data === 'string' ? data : JSON.stringify(data)); return res }
        const { default: handler } = await server.ssrLoadModule('/api/grade.js')
        await handler(req, res)
      } catch (err) {
        res.statusCode = 500
        res.end(JSON.stringify({ ok: false, error: String(err?.message || err) }))
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), buildMarker(), devApi()],
})
