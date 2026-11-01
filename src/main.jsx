import { lazy, StrictMode, Suspense } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// The July 2026 concept lab stays reachable at /mockups. Everything else is the site.
const MockupLab = lazy(() => import('./mockups/MockupLab.jsx'))
const isLabPath = window.location.pathname.startsWith('/mockups')

const root = document.getElementById('root')
const tree = (
  <StrictMode>
    {isLabPath ? <Suspense fallback={null}><MockupLab /></Suspense> : <App />}
  </StrictMode>
)
// Site pages arrive prerendered (scripts/prerender.mjs), so hydrate them; the lab still renders from an empty root
if (root.hasChildNodes() && !isLabPath) hydrateRoot(root, tree)
else createRoot(root).render(tree)
