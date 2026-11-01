import { companies, studies, workSlugs, products, clients, pricing, BOOK } from './content.jsx'
import { services, industry, locations, process, pricingPage, partnersPage } from './pages.jsx'
import { Shell, Head, Section, JsonLd, SITE, ORG } from './Layout.jsx'

// The service, industry, location, hub, pricing and partner pages, plus the lists the home page reuses.

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

const Arrow = () => <svg className="arrow" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M5 13 13 5M6.5 5H13v6.5" stroke="currentColor" strokeWidth="1.5" /></svg>

// Two-column rows: a short heading and a short paragraph
export const Rows = ({ items }) => <ul className="rows">{items.map(([h, p]) => <li key={h}><h3>{h}</h3><p>{p}</p></li>)}</ul>

const allServices = [...services, { slug: 'professional-services', path: industry.path, nav: 'Law, finance and medical sites', description: industry.description, lede: industry.lede }]
const firstLine = d => `${d.split('. ')[0].replace(/\.$/, '')}.`

export const ServiceList = ({ exclude }) => <ul className="list">{allServices.filter(s => s.path !== exclude).map(s => <li key={s.path}>
  <a href={s.path}><strong>{s.nav}</strong><span>{firstLine(s.lede)}</span><Arrow /></a>
</li>)}</ul>

// Products and client work as plain rows: name, one line, where it lives
export const WorkList = () => <ul className="list">
  {products.map(p => <li key={p.slug}><a href={p.page}><strong>{p.name}</strong><span>{p.line}</span><small>{p.url ? p.host : 'Preview'}</small><Arrow /></a></li>)}
  {clients.map(c => <li key={c.slug}><a href={c.url} target="_blank" rel="noreferrer"><strong>{c.name}</strong><span>{c.line}</span><small>{c.host}</small><Arrow /></a></li>)}
</ul>

export function Prices({ keys = ['launch', 'care', 'growth'], scopes = {} }) {
  return <div className="prices">{keys.map(k => { const p = pricing[k]; return <div key={k} className="price">
    <h3>{p.name}</h3>
    <p className="price-num">{p.price}<span>{p.unit}</span></p>
    <p>{scopes[k] || p.scope}</p>
  </div> })}</div>
}

// Case studies as rows with the product's image
export function Cases({ slugs, note }) {
  return <>
    {note && <p className="note">{note}</p>}
    <ul className="cases">{slugs.map(s => { const c = companies.find(x => x.slug === s), st = studies[s]; return <li key={s}>
      <a href={`/work/${s}`}>
        <img src={`/work/${s}/og.jpg`} alt="" loading="lazy" decoding="async" width="1200" height="630" />
        <span className="case-text"><strong>{c.name}</strong><span>{c.line}</span>{st && <small>{st.stack}</small>}</span>
      </a>
    </li> })}</ul>
  </>
}

export const Steps = ({ items = process }) => <ol className="rows">{items.map(([h, p]) => <li key={h}><h3>{h}</h3><p>{p}</p></li>)}</ol>

function Ask({ line = 'Have something in mind?' }) {
  return <section className="ask wrap">
    <h2>{line}</h2>
    <div className="actions"><a className="btn btn-primary" {...BOOK}>Book a call</a></div>
  </section>
}

const Links = ({ items }) => <ul className="links">{items.map(([t, h]) => <li key={h}><a href={h}>{t}</a></li>)}</ul>

export function ServicePage({ slug }) {
  const s = services.find(x => x.slug === slug)
  return <Shell title={s.title}>
    <JsonLd data={serviceLd(s, s.kicker)} />
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services'], [s.nav, s.path]])} />
    <JsonLd data={faqLd(s.faq)} />
    <Head h1={s.h1} lede={s.lede} />
    <Section title="What you get"><Rows items={s.points} /></Section>
    <Section title="What it costs">
      {s.package ? <Prices keys={[s.package].flat()} /> : <p className="text">{s.priceNote}</p>}
    </Section>
    <Section title="Work we’ve built"><Cases slugs={s.cases} /></Section>
    <Section title="How it runs"><Steps /></Section>
    <Section title="Short answers"><Rows items={s.faq} /></Section>
    <Ask />
    <Section title="Also"><Links items={allServices.filter(x => x.path !== s.path).map(x => [x.nav, x.path])} /></Section>
  </Shell>
}

export function IndustryPage() {
  const s = industry
  return <Shell title={s.title}>
    <JsonLd data={serviceLd(s, 'Website design for law firms, financial advisors and medical practices')} />
    <JsonLd data={crumbs([['Home', '/'], ['Law, finance and medical', s.path]])} />
    <Head h1={s.h1} lede={s.lede} />
    <Section title="Who it’s for"><Rows items={s.points} /><p className="note">{s.note}</p></Section>
    <Section title="What it costs"><Prices /></Section>
    <Section title="Work we’ve built"><Cases slugs={s.cases} note={s.caseNote} /></Section>
    <Section title="Where"><Links items={locations.map(l => [l.place, l.path])} /></Section>
    <Ask />
  </Shell>
}

export function LocationPage({ slug }) {
  const l = locations.find(x => x.slug === slug)
  const area = l.slug === 'new-york-city' || l.slug === 'manhattan' || l.slug === 'brooklyn' ? { '@type': 'City', name: 'New York', containedInPlace: { '@type': 'State', name: 'New York' } } : { '@type': 'AdministrativeArea', name: `${l.place}, NY` }
  return <Shell title={l.title}>
    <JsonLd data={serviceLd(l, `Web and AI app development in ${l.place}`, [area])} />
    <JsonLd data={crumbs([['Home', '/'], [l.place, l.path]])} />
    <Head h1={l.h1} lede={l.lede} />
    <Section title="What we build"><ServiceList /></Section>
    <Section title="What it costs"><Prices /><p className="note">AI apps, agent systems and MVPs are priced in a written scope after a call.</p></Section>
    <Section title="Work we’ve built"><Cases slugs={l.cases} /></Section>
    <Section title="Nearby"><Links items={l.near.map(n => { const x = locations.find(y => y.slug === n); return [x.place, x.path] })} /></Section>
    <Ask />
  </Shell>
}

export function WorkHub() {
  return <Shell title="Work | SparkTech Studio">
    <JsonLd data={crumbs([['Home', '/'], ['Work', '/work']])} />
    <Head h1="What we’ve built." lede="AI products and web apps, live and in use. Each case study covers the problem, what we built, and what it runs on." cta={false} />
    <Section><Cases slugs={[...workSlugs, 'spacial']} /></Section>
    <Section title="Client work"><ul className="list">{clients.map(c => <li key={c.slug}><a href={c.url} target="_blank" rel="noreferrer"><strong>{c.name}</strong><span>{c.line}</span><small>{c.host}</small><Arrow /></a></li>)}</ul></Section>
    <Ask line="Want something built like this?" />
  </Shell>
}

export function ServicesHub() {
  return <Shell title="Services | SparkTech Studio">
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services']])} />
    <Head h1="What we build." lede="AI web apps, MVPs and agent systems. Websites for law, finance and medical firms. Retainers to keep it all getting better." />
    <Section><ServiceList /></Section>
    <Section title="What it costs"><Prices /><p className="note">AI apps, agent systems, web apps and MVPs are priced in a written scope after a call.</p></Section>
    <Section title="How it runs"><Steps /></Section>
    <Ask />
  </Shell>
}

export function PricingPage() {
  const s = pricingPage
  return <Shell title={s.title}>
    <JsonLd data={crumbs([['Home', '/'], ['Pricing', s.path]])} />
    <Head h1="Plain prices." lede="One website package and two monthly retainers. Everything else is priced in a written scope after a call." />
    <Section><Prices scopes={s.scopes} /></Section>
    <Section title="Everything else"><p className="text">AI apps, agent systems, web apps and MVPs are priced in a written scope after a call, because no two are the same size.</p></Section>
    <Ask line="Want a number for your project?" />
  </Shell>
}

export function PartnersPage() {
  const s = partnersPage
  return <Shell title={s.title}>
    <JsonLd data={crumbs([['Home', '/'], ['Partners', s.path]])} />
    <Head h1={s.h1} lede={s.lede} />
    <Section title="Who it’s for"><Rows items={s.who} /></Section>
    <Section title="What we build"><ServiceList exclude={industry.path} /></Section>
    <Section title="How it runs"><Steps items={s.how} /></Section>
    <Section title="Work we’ve built"><Cases slugs={workSlugs} /></Section>
    <Ask line="Have a client or a cohort in mind?" />
  </Shell>
}
