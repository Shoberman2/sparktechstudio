import { useEffect } from 'react'
import Form from './designs/Form.jsx'
import Company from './designs/Company.jsx'
import NotFound from './designs/NotFound.jsx'
import Privacy from './designs/Privacy.jsx'
import Systems from './designs/Systems.jsx'
import { ServicePage, IndustryPage, LocationPage, WorkHub, ServicesHub } from './designs/Page.jsx'
import { companies } from './designs/content.jsx'
import { services, industry, locations } from './designs/pages.jsx'

// The live site is the Form direction (chosen 2026-10-15). Case studies live at /work/<slug>; the 2026-10-27 rebuild
// adds /work, /services, five service pages, one industry page and six location pages (copy in designs/pages.jsx).
// `path` is passed in so the same tree renders in the browser and in the build-time prerender (scripts/prerender.mjs).
// The previous operating-model site (VentureSite) stays on disk, unmounted.
export default function App({ path = typeof window !== 'undefined' ? window.location.pathname : '/' }) {
  const p = path.length > 1 ? path.replace(/\/$/, '') : path
  const parts = p.split('/')
  const slug = parts[1] === 'work' ? parts[2] : null
  const isHome = p === '/' || p === '/index.html'
  useEffect(() => { if (isHome) document.title = 'SparkTech Studio | AI Web Apps, MVPs and Websites in NYC' }, [isHome])
  if (slug && companies.some(c => c.slug === slug)) return <Company slug={slug} />
  if (p === '/work') return <WorkHub />
  if (p === '/services') return <ServicesHub />
  const service = services.find(s => s.path === p)
  if (service) return <ServicePage slug={service.slug} />
  if (p === industry.path) return <IndustryPage />
  const location = locations.find(l => l.path === p)
  if (location) return <LocationPage slug={location.slug} />
  if (p === '/privacy') return <Privacy />
  if (p === '/systems') return <Systems />
  if (!isHome) return <NotFound />
  return <Form />
}
