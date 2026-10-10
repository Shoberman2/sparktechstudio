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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), buildMarker()],
})
