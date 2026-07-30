import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const MockupLab = lazy(() => import('./mockups/MockupLab.jsx'))
const isStudioPath = window.location.pathname === '/'
  || window.location.pathname.startsWith('/capabilities/')
  || window.location.pathname.startsWith('/mockups')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isStudioPath ? (
      <Suspense fallback={null}>
        <MockupLab />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
