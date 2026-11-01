import { Home, ServicePage, ServicesHub, IndustryPage, LocationPage, WorkHub, PricingPage, PartnersPage, SystemsPage, CaseStudy, Privacy, NotFound } from './ink/Pages.jsx'
import { companies } from './designs/content.jsx'
import { services, industry, locations, pricingPage, partnersPage } from './designs/pages.jsx'

// Direction C, Ink Type (src/ink). Copy and route data live in designs/content.jsx and designs/pages.jsx.
// `path` is passed in so the same tree renders in the browser and in the build-time prerender (scripts/prerender.mjs).
// The earlier Form direction and its components stay on disk, unmounted.
export default function App({ path = typeof window !== 'undefined' ? window.location.pathname : '/' }) {
  const p = path.length > 1 ? path.replace(/\/$/, '') : path
  const parts = p.split('/')
  const slug = parts[1] === 'work' ? parts[2] : null
  if (slug && companies.some(c => c.slug === slug)) return <CaseStudy slug={slug} />
  if (p === '/' || p === '/index.html') return <Home />
  if (p === '/work') return <WorkHub />
  if (p === '/services') return <ServicesHub />
  if (p === pricingPage.path) return <PricingPage />
  if (p === partnersPage.path) return <PartnersPage />
  const service = services.find(s => s.path === p)
  if (service) return <ServicePage slug={service.slug} />
  if (p === industry.path) return <IndustryPage />
  const location = locations.find(l => l.path === p)
  if (location) return <LocationPage slug={location.slug} />
  if (p === '/privacy') return <Privacy />
  if (p === '/systems') return <SystemsPage />
  return <NotFound />
}
