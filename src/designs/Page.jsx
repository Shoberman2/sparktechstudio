import { useEffect } from 'react'
import { companies, studies, workSlugs, pricing, BOOK } from './content.jsx'
import { services, industry, locations, process, pricingPage, partnersPage } from './pages.jsx'
import Footer from './Footer.jsx'
import './buttons.css'
import './Form.css'
import './Page.css'

// The white page shell for the service, industry, location and hub pages: the site nav, one column of ruled sections, the dark footer.
// Bare on purpose (DESIGN.md): big type, hairline rules, pill buttons, no cards or imagery.
const SITE = 'https://www.sparktechstudio.com'
const ORG = `${SITE}/#org`

export function SiteNav() {
  return <header className="fm-nav pg-nav">
    <a href="/" className="fm-mark"><img src="/logo.svg" width="18" height="18" alt="" />SparkTech Studio</a>
    <nav><a href="/services">Services</a><a href="/work">Work</a><a href="/partners">Partners</a><a href="/systems">System</a><a href="#contact">Contact</a></nav>
  </header>
}

// Structured data rendered into the page itself, so the prerendered HTML carries it
const JsonLd = ({ data }) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />

const crumbs = list => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })) })

const offer = key => {
  const p = pricing[key], [lo, hi] = p.price.match(/[\d,]+k?/g).map(v => Number(v.replace(/,/g, '').replace('k', '000')))
  return { '@type': 'Offer', name: p.name, priceSpecification: { '@type': 'PriceSpecification', priceCurrency: 'USD', minPrice: lo, maxPrice: hi, ...(p.unit === 'a month' ? { unitText: 'MONTH' } : {}) } }
}

const serviceLd = (page, name, area = [{ '@type': 'City', name: 'New York' }, { '@type': 'Place', name: 'Long Island, NY' }]) => {
  const keys = [page.package].flat().filter(Boolean)
  return { '@context': 'https://schema.org', '@type': 'Service', name, serviceType: name, url: `${SITE}${page.path}`, provider: { '@id': ORG }, areaServed: area, ...(keys.length ? { offers: keys.map(offer) } : {}) }
}

const faqLd = items => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) })

function Shell({ title, children }) {
  useEffect(() => { document.title = title }, [title])
  useEffect(() => { if (window.location.hash === '') window.scrollTo(0, 0) }, [title])
  return <div className="fm pg">
    <SiteNav />
    <main id="main">{children}</main>
    <Footer />
  </div>
}

function Head({ kicker, h1, lede, cta = true }) {
  return <section className="pg-head">
    <p className="fm-eyebrow">{kicker}</p>
    <h1>{h1}</h1>
    {lede && <p className="pg-lede">{lede}</p>}
    {cta && <div className="pg-actions">
      <a className="btn" {...BOOK}>Book a call</a>
      <a className="btn btn-ghost" href="/work">See the work</a>
    </div>}
  </section>
}

// A visible, deliberately ugly marker for proof we don't have yet. Never replace it with made-up copy.
export const Todo = ({ children }) => <aside className="pg-todo" role="note"><strong>TODO</strong><span>{children}</span></aside>

function Section({ label, title, children, id }) {
  return <section className="pg-sec" id={id}>
    <div className="pg-sec-head"><p className="pg-label">{label}</p>{title && <h2>{title}</h2>}</div>
    <div className="pg-sec-body">{children}</div>
  </section>
}

const Points = ({ items }) => <ul className="pg-rows">{items.map(([h, p]) => <li key={h}><h3>{h}</h3><p>{p}</p></li>)}</ul>

export function Packages({ keys, scopes = {} }) {
  return <ul className="pg-rows pg-prices">{keys.map(k => { const p = pricing[k]; return <li key={k}>
    <h3>{p.name}</h3>
    <p className="pg-price"><strong>{p.price}</strong><span>{p.unit}</span></p>
    <p>{scopes[k] || p.scope}</p>
  </li> })}</ul>
}

// Two (or four) case studies as big ruled rows, each with what was built and what it runs on
export function Cases({ slugs, note }) {
  return <>
    {note && <p className="pg-note">{note}</p>}
    <ul className="pg-cases">{slugs.map(s => { const c = companies.find(x => x.slug === s), st = studies[s]; return <li key={s}>
      <a href={`/work/${s}`}>
        <strong>{c.name}</strong>
        <span className="pg-case-line">{c.line}</span>
        <span className="pg-case-meta">{st.stack} · {c.host}</span>
        <span className="pg-case-go" aria-hidden="true">Read the case study</span>
      </a>
    </li> })}</ul>
  </>
}

const Process = () => <ol className="pg-steps">{process.map(([h, p]) => <li key={h}><h3>{h}</h3><p>{p}</p></li>)}</ol>

function Ask({ line = 'Have something in mind?' }) {
  return <section className="pg-ask">
    <p>{line}</p>
    <a className="btn" {...BOOK}>Book a call</a>
  </section>
}

const otherServices = path => <ul className="pg-links">{services.filter(s => s.path !== path).map(s => <li key={s.slug}><a href={s.path}>{s.nav}</a></li>)}<li><a href={industry.path}>Law, finance and medical sites</a></li></ul>

export function ServicePage({ slug }) {
  const s = services.find(x => x.slug === slug)
  return <Shell title={s.title}>
    <JsonLd data={serviceLd(s, s.kicker)} />
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services'], [s.nav, s.path]])} />
    <JsonLd data={faqLd(s.faq)} />
    <Head kicker={s.kicker} h1={s.h1} lede={s.lede} />
    <Section label="What you get"><Points items={s.points} /></Section>
    <Section label="Pricing">
      {s.package ? <Packages keys={[s.package].flat()} /> : <p className="pg-text">{s.priceNote}</p>}
    </Section>
    <Section label="Case studies" title={<>Work we’ve <em>built.</em></>}><Cases slugs={s.cases} /></Section>
    <Section label="How it runs"><Process /></Section>
    <Section label="Questions" title={<>The short <em>answers.</em></>}><Points items={s.faq} /></Section>
    <Ask />
    <Section label="Also"><>{otherServices(s.path)}</></Section>
  </Shell>
}

export function IndustryPage() {
  const s = industry
  return <Shell title={s.title}>
    <JsonLd data={serviceLd(s, 'Website design for law firms, financial advisors and medical practices')} />
    <JsonLd data={crumbs([['Home', '/'], ['Law, finance and medical', s.path]])} />
    <Head kicker={s.kicker} h1={s.h1} lede={s.lede} />
    <Section label="Who it’s for"><Points items={s.points} /><p className="pg-note">{s.note}</p></Section>
    <Section label="Pricing"><Packages keys={['launch', 'care', 'growth']} /></Section>
    <Section label="Case studies" title={<>Work we’ve <em>built.</em></>}>
      <Cases slugs={s.cases} note={s.caseNote} />
      <Todo>{s.todo}</Todo>
    </Section>
    <Section label="Where"><ul className="pg-links">{locations.map(l => <li key={l.slug}><a href={l.path}>{l.place}</a></li>)}</ul></Section>
    <Ask />
  </Shell>
}

export function LocationPage({ slug }) {
  const l = locations.find(x => x.slug === slug)
  const area = l.slug === 'new-york-city' || l.slug === 'manhattan' || l.slug === 'brooklyn' ? { '@type': 'City', name: 'New York', containedInPlace: { '@type': 'State', name: 'New York' } } : { '@type': 'AdministrativeArea', name: `${l.place}, NY` }
  return <Shell title={l.title}>
    <JsonLd data={serviceLd(l, `Web and AI app development in ${l.place}`, [area])} />
    <JsonLd data={crumbs([['Home', '/'], [l.place, l.path]])} />
    <Head kicker={l.kicker} h1={l.h1} lede={l.lede} />
    <Section label={`In ${l.place}`}>
      <Todo>{l.todo}</Todo>
    </Section>
    <Section label="What we build">
      <ul className="pg-links">{services.map(s => <li key={s.slug}><a href={s.path}>{s.nav}</a></li>)}<li><a href={industry.path}>Law, finance and medical sites</a></li></ul>
    </Section>
    <Section label="Pricing"><Packages keys={['launch', 'care', 'growth']} /><p className="pg-note">AI apps and MVPs are priced in a written scope after a call.</p></Section>
    <Section label="Case studies" title={<>Work we’ve <em>built.</em></>}><Cases slugs={l.cases} /></Section>
    <Section label="Nearby"><ul className="pg-links">{l.near.map(n => { const x = locations.find(y => y.slug === n); return <li key={n}><a href={x.path}>{x.place}</a></li> })}</ul></Section>
    <Ask />
  </Shell>
}

export function WorkHub() {
  return <Shell title="Work | SparkTech Studio">
    <JsonLd data={crumbs([['Home', '/'], ['Work', '/work']])} />
    <Head kicker="Work" h1={<>What we’ve <em>built.</em></>} lede="AI products and web apps, live and in use. Each case study covers the problem, what we built, and what it runs on." cta={false} />
    <section className="pg-sec pg-sec-wide"><Cases slugs={workSlugs} /></section>
    <Ask line="Want something built like this?" />
  </Shell>
}

export function ServicesHub() {
  return <Shell title="Services | SparkTech Studio">
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services']])} />
    <Head kicker="Services" h1={<>What we <em>build.</em></>} lede="AI web apps and MVPs first. Websites for law, finance and medical firms second. Retainers to keep both getting better." />
    <section className="pg-sec pg-sec-wide">
      <ul className="pg-cases">{[...services, { path: industry.path, nav: 'Law, finance and medical sites', description: industry.description }].map(s => <li key={s.path}>
        <a href={s.path}><strong>{s.nav}</strong><span className="pg-case-line">{s.description.split('. ')[0].replace(/\.$/, '')}.</span></a>
      </li>)}</ul>
    </section>
    <Section label="Pricing"><Packages keys={['launch', 'care', 'growth']} /><p className="pg-note">AI apps, web apps and MVPs are priced in a written scope after a call.</p></Section>
    <Section label="How it runs"><Process /></Section>
    <Ask />
  </Shell>
}

export function PricingPage() {
  const s = pricingPage
  return <Shell title={s.title}>
    <JsonLd data={crumbs([['Home', '/'], ['Pricing', s.path]])} />
    <Head kicker="Pricing" h1={<>Plain <em>prices.</em></>} lede="One website package and two monthly retainers. AI apps, web apps and MVPs are priced in a written scope after a call." />
    <section className="pg-sec pg-sec-wide"><Todo>{s.todo}</Todo></section>
    <Section label="Website"><Packages keys={['launch']} /></Section>
    <Section label="Retainers" title={<>After <em>launch.</em></>}>
      <Packages keys={['care', 'growth']} scopes={s.scopes} />
    </Section>
    <Section label="Everything else"><p className="pg-text">AI apps, web apps and MVPs are priced in a written scope after a call, because no two are the same size.</p></Section>
    <Ask line="Want a number for your project?" />
  </Shell>
}

export function PartnersPage() {
  const s = partnersPage
  return <Shell title={s.title}>
    <JsonLd data={crumbs([['Home', '/'], ['Partners', s.path]])} />
    <Head kicker={s.kicker} h1={s.h1} lede={s.lede} />
    <Section label="Who it’s for"><Points items={s.who} /></Section>
    <Section label="What we build"><ul className="pg-links">{services.map(x => <li key={x.slug}><a href={x.path}>{x.nav}</a></li>)}</ul></Section>
    <Section label="How it runs"><ol className="pg-steps">{s.how.map(([h, p]) => <li key={h}><h3>{h}</h3><p>{p}</p></li>)}</ol></Section>
    <Section label="Case studies" title={<>Work we’ve <em>built.</em></>}><Cases slugs={workSlugs} /></Section>
    <Ask line="Have a client or a cohort in mind?" />
  </Shell>
}
