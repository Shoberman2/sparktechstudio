import { useEffect } from 'react'
import Form from './designs/Form.jsx'
import Company from './designs/Company.jsx'
import NotFound from './designs/NotFound.jsx'
import Privacy from './designs/Privacy.jsx'
import { companies } from './designs/content.jsx'

// The live site is the Form direction (chosen 2026-10-15). Company pages live at /work/<slug>.
// `path` is passed in so the same tree renders in the browser and in the build-time prerender (scripts/prerender.mjs).
// The previous operating-model site (VentureSite) stays on disk, unmounted.
export default function App({ path = typeof window !== 'undefined' ? window.location.pathname : '/' }) {
  const parts = path.split('/')
  const slug = parts[1] === 'work' ? parts[2] : null
  useEffect(() => { if (!slug) document.title = 'SparkTech Studio | We create the future' }, [slug])
  if (slug && companies.some(c => c.slug === slug)) return <Company slug={slug} />
  if (path === '/privacy') return <Privacy />
  if (path !== '/' && path !== '/index.html') return <NotFound />
  return <Form />
}
