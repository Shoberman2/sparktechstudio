import { useEffect } from 'react'
import Form from './designs/Form.jsx'
import Company from './designs/Company.jsx'
import NotFound from './designs/NotFound.jsx'
import Privacy from './designs/Privacy.jsx'
import Systems from './designs/Systems.jsx'
import Services from './designs/Services.jsx'
import { companies } from './designs/content.jsx'
import { meta } from './designs/seo.js'

// The live site is the Form direction (chosen 2026-10-15). Company pages live at /work/<slug>.
// `path` is passed in so the same tree renders in the browser and in the build-time prerender (scripts/prerender.mjs).
// The previous operating-model site (VentureSite) stays on disk, unmounted.
export default function App({ path = typeof window !== 'undefined' ? window.location.pathname : '/' }) {
  const parts = path.split('/')
  const slug = parts[1] === 'work' ? parts[2] : null
  useEffect(() => { document.title = meta(path.replace(/\/+$/, '') || '/').title }, [path])
  if (slug && companies.some(c => c.slug === slug)) return <Company slug={slug} />
  if (path === '/privacy') return <Privacy />
  if (path === '/systems') return <Systems />
  if (path === '/services') return <Services />
  if (path !== '/' && path !== '/index.html') return <NotFound />
  return <Form />
}
