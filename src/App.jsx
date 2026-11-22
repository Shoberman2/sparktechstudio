import Home from './site/Home.jsx'
import System from './site/System.jsx'
import { ServicePage, ServicesHub, PartnersPage, GraderPage, Privacy, Terms, NotFound } from './site/Pages.jsx'
import { services, partnersPage } from './designs/pages.jsx'

// Direction A, Spark Cloud (src/site). Copy lives in designs/content.jsx, designs/pages.jsx and site/facts.js.
// `path` is passed in so the same tree renders in the browser and in the build-time prerender (scripts/prerender.mjs).
// The earlier directions (Form, VentureSite, the labs) stay on disk, unmounted.
// 2026-11-18 (Spencer): the site states no location, so the /locations pages are unmounted too (LocationPage stays on disk).
// 2026-11-21 (Spencer): the law, finance and medical page is removed ("unnecessary"); IndustryPage stays on disk, unmounted.
// 2026-11-18 (Spencer): no product or company is named on the site. CaseStudy.jsx, WorkHub and Directory.jsx stay on disk, unmounted.
export default function App({ path = typeof window !== 'undefined' ? window.location.pathname : '/' }) {
  const p = path.length > 1 ? path.replace(/\/$/, '') : path
  if (p === '/services') return <ServicesHub />
  if (p === partnersPage.path) return <PartnersPage />
  const service = services.find(s => s.path === p)
  if (service) return <ServicePage slug={service.slug} />
  if (p === '/grader') return <GraderPage />
  if (p === '/privacy') return <Privacy />
  if (p === '/terms') return <Terms />
  if (p === '/systems') return <System />
  if (p !== '/' && p !== '/index.html') return <NotFound />
  return <Home />
}
