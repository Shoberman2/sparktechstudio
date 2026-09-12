import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// The July 2026 concept lab stays reachable at /mockups. Everything else is the site.
const MockupLab = lazy(() => import('./mockups/MockupLab.jsx'))
const isLabPath = window.location.pathname.startsWith('/mockups')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isLabPath ? (
      <Suspense fallback={null}>
        <MockupLab />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
