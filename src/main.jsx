import { lazy, StrictMode, Suspense } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// The July 2026 concept lab stays reachable at /mockups. Everything else is the site.
const MockupLab = lazy(() => import('./mockups/MockupLab.jsx'))
const isLabPath = window.location.pathname.startsWith('/mockups')
// Three new directions under review at /designs
const DesignLab = lazy(() => import('./designs/DesignLab.jsx'))
const isDesignPath = window.location.pathname.startsWith('/designs')

const root = document.getElementById('root')
const tree = (
  <StrictMode>
    {isDesignPath ? (
      <Suspense fallback={null}>
        <DesignLab />
      </Suspense>
    ) : isLabPath ? (
      <Suspense fallback={null}>
        <MockupLab />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
)
// Site pages arrive prerendered (scripts/prerender.mjs), so hydrate them; the labs still render from an empty root
if (root.hasChildNodes() && !isLabPath && !isDesignPath) hydrateRoot(root, tree)
else createRoot(root).render(tree)
