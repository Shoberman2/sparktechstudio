import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
const App = lazy(() => import('./App.jsx'))

const Studio = lazy(() => import('./studio/Studio.jsx'))
const MockupLab = lazy(() => import('./mockups/MockupLab.jsx'))
const isStudioPath = window.location.pathname === '/'
  || window.location.pathname.startsWith('/capabilities/')
  || window.location.pathname.startsWith('/mockups')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isStudioPath ? (
      <Suspense fallback={null}>
        {window.location.pathname.startsWith('/mockups') ? <MockupLab /> : <Studio />}
      </Suspense>
    ) : (
      <Suspense fallback={null}><App /></Suspense>
    )}
  </StrictMode>,
)
