import { lazy, StrictMode, Suspense } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'

// The July 2026 concept lab stays reachable at /mockups. Everything else is the site.
const MockupLab = lazy(() => import('./mockups/MockupLab.jsx'))
const isLabPath = window.location.pathname.startsWith('/mockups')
// Three new directions under review at /designs
const DesignLab = lazy(() => import('./designs/DesignLab.jsx'))
const isDesignPath = window.location.pathname.startsWith('/designs')
// The old global stylesheet only matters to the two labs now; the site styles itself (src/ink/ink.css)
if (isLabPath || isDesignPath) import('./index.css')

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
