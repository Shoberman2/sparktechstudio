import { renderToString } from 'react-dom/server'
import App from './App.jsx'

// Used only by scripts/prerender.mjs after `vite build`, so every route ships as real HTML.
export function render(path) {
  return renderToString(<App path={path} />)
}
