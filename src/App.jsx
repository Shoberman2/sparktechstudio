import Home from './designs/Home.jsx'
import Company from './designs/Company.jsx'
import NotFound from './designs/NotFound.jsx'
import Privacy from './designs/Privacy.jsx'
import Systems from './designs/Systems.jsx'
import { ServicePage, IndustryPage, LocationPage, WorkHub, ServicesHub, PricingPage, PartnersPage } from './designs/Page.jsx'
import { companies } from './designs/content.jsx'
import { services, industry, locations, pricingPage, partnersPage } from './designs/pages.jsx'
import './designs/site.css'

// One router for every page. Copy lives in designs/content.jsx and designs/pages.jsx; the shared shell in designs/Layout.jsx.
// `path` is passed in so the same tree renders in the browser and in the build-time prerender (scripts/prerender.mjs).
export default function App({ path = typeof window !== 'undefined' ? window.location.pathname : '/' }) {
  const p = path.length > 1 ? path.replace(/\/$/, '') : path
  const parts = p.split('/')
  const slug = parts[1] === 'work' ? parts[2] : null
  if (slug && companies.some(c => c.slug === slug)) return <Company slug={slug} />
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
  if (p === '/systems') return <Systems />
  if (p === '/' || p === '/index.html') return <Home />
  return <NotFound />
}
