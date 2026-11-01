import { Shell, Head, JsonLd, Laptop, Prices, ServiceList } from './Site.jsx'
import { WorkGrid } from './Home.jsx'
import { companies, studies, workSlugs, pricing, systems } from '../designs/content.jsx'
import { services, industry, locations, pricingPage, partnersPage } from '../designs/pages.jsx'
import { products, client, scopedNote, EMAIL, screen } from './facts.js'

const SITE = 'https://www.sparktechstudio.com'
const ORG = `${SITE}/#org`

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

const Sec = ({ title, children, id }) => <section className="sec" id={id}><div className="wrap">{title && <h2 className="center reveal">{title}</h2>}{children}</div></section>
const Points = ({ items }) => <ul className="points">{items.map(([h, p]) => <li key={h} className="reveal"><h3>{h}</h3><p>{p}</p></li>)}</ul>
const QA = ({ items }) => <div className="qa">{items.map(([q, a]) => <div key={q} className="reveal"><h3>{q}</h3><p>{a}</p></div>)}</div>

// Two case studies as real screens in laptops, each linking to its page
function Cases({ slugs, note }) {
  return <>
    {note && <p className="note reveal">{note}</p>}
    <div className="cases">{slugs.map(s => { const p = products.find(x => x.slug === s); return <a key={s} className="case reveal" href={`/work/${s}`}>
      <Laptop src={screen(s, 'desktop')} alt={`The ${p.name} website, ${p.host}`} />
      <h3>{p.name}</h3>
      <p>{p.line}</p>
    </a> })}</div>
  </>
}

// What an AI agent can do for a business, in plain words. Kept to what we can set up today.
const agentJobs = [
  ['Answer questions', 'Replies to customers from your own info, day or night.'],
  ['Sort the inbox', 'Reads new requests and sends each one to the right person.'],
  ['Follow up', 'Sends the reminders and next steps nobody has time for.'],
]

function AgentsPage({ s }) {
  return <Shell path={s.path} title={s.title}>
    <JsonLd data={serviceLd(s, 'AI agents')} />
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services'], ['AI agents', s.path]])} />
    <Head h1={s.h1} lede={s.lede} />
    <Sec title="What an Agent Can Do"><Points items={agentJobs} /></Sec>
    <Sec title="How We Work"><p className="lede center reveal">We pick one job, set up the agent, and you approve what it can do and spend.</p></Sec>
    <Sec title="Pricing"><p className="lede center reveal">{s.priceNote}</p></Sec>
  </Shell>
}

export function ServicePage({ slug }) {
  const s = services.find(x => x.slug === slug)
  if (slug === 'ai-agents') return <AgentsPage s={s} />
  return <Shell path={s.path} title={s.title}>
    <JsonLd data={serviceLd(s, s.kicker)} />
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services'], [s.nav, s.path]])} />
    <JsonLd data={faqLd(s.faq)} />
    <Head h1={s.h1} lede={s.lede} />
    <Sec title="What You Get"><Points items={s.points} /></Sec>
    <Sec title="Pricing">
      {s.package ? <Prices keys={[s.package].flat()} /> : <p className="lede center reveal">{s.priceNote}</p>}
    </Sec>
    <Sec title="Work We've Built"><Cases slugs={s.cases} /></Sec>
    <Sec title="Questions"><QA items={s.faq} /></Sec>
    <Sec title="Other Services"><ServiceList skip={s.path} /></Sec>
  </Shell>
}

export function ServicesHub() {
  return <Shell path="/services" title="Services | SparkTech Studio">
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services']])} />
    <Head h1="Services" lede="Websites and AI agents, plus the apps and upkeep around them." cta={false} />
    <section className="sec-tight"><div className="wrap"><ServiceList /></div></section>
  </Shell>
}

export function PricingPage() {
  const s = pricingPage
  return <Shell path="/pricing" title={s.title}>
    <JsonLd data={crumbs([['Home', '/'], ['Pricing', s.path]])} />
    <Head h1="Plain Prices" lede="One website package and two monthly retainers." />
    <Sec title="Launch Site"><Prices keys={['launch']} /></Sec>
    <Sec title="After Launch"><Prices keys={['care', 'growth']} scopes={s.scopes} /></Sec>
    <Sec title="Everything Else"><p className="lede center reveal">{scopedNote}</p></Sec>
  </Shell>
}

export function PartnersPage() {
  const s = partnersPage
  return <Shell path="/partners" title={s.title}>
    <JsonLd data={crumbs([['Home', '/'], ['Partners', s.path]])} />
    <Head h1={s.h1} lede={s.lede} />
    <Sec title="Who It's For"><Points items={s.who} /></Sec>
    <Sec title="What We Build"><ServiceList /></Sec>
    <Sec title="Work We've Built"><Cases slugs={['utern', 'ballotwatch']} /></Sec>
  </Shell>
}

export function WorkHub() {
  return <Shell path="/work" title="Work | SparkTech Studio">
    <JsonLd data={crumbs([['Home', '/'], ['Work', '/work']])} />
    <Head h1="Our Work" lede="Real products, live today, and a site we built for a client." cta={false} />
    <section className="sec-tight"><div className="wrap"><WorkGrid items={[...products, client]} /></div></section>
  </Shell>
}

export function CaseStudy({ slug }) {
  const c = companies.find(x => x.slug === slug), st = studies[slug], p = products.find(x => x.slug === slug)
  const path = `/work/${slug}`
  return <Shell path={path} title={`${c.name} | SparkTech Studio`}>
    <JsonLd data={crumbs([['Home', '/'], ['Work', '/work'], [c.name, path]])} />
    <Head h1={c.name} lede={c.lede} cta={false} />
    {p && <section className="sec-tight"><div className="wrap product">
      <div className="stage stage-laptop reveal" style={{ marginTop: 0 }}><Laptop src={screen(slug, 'desktop')} alt={`The ${c.name} website, ${c.host}`} eager /></div>
      <div className="links"><a className="tlink" href={p.url} target="_blank" rel="noreferrer">Visit {p.host}</a></div>
    </div></section>}
    {st ? <>
      <Sec title="The Problem"><p className="read reveal" style={{ marginTop: 40 }}>{st.problem}</p></Sec>
      <Sec title="What We Built">
        <div className="read reveal" style={{ marginTop: 40 }}>
          <ul className="built">{st.built.map(b => <li key={b}>{b}</li>)}</ul>
          <p className="meta">Runs on {st.stack}. {st.status}</p>
        </div>
      </Sec>
    </> : <Sec title="In the Preview">
      <div className="read reveal" style={{ marginTop: 40 }}><ul className="built">{c.today.map(b => <li key={b}>{b}</li>)}</ul></div>
    </Sec>}
  </Shell>
}

export function IndustryPage() {
  const s = industry
  return <Shell path={s.path} title={s.title}>
    <JsonLd data={serviceLd(s, 'Website design for law firms, financial advisors and medical practices')} />
    <JsonLd data={crumbs([['Home', '/'], ['Law, finance and medical', s.path]])} />
    <Head h1={s.h1} lede={s.lede} />
    <Sec title="Who It's For"><Points items={s.points} /><p className="note reveal">{s.note}</p></Sec>
    <Sec title="Pricing"><Prices /></Sec>
    <Sec title="Work We've Built"><Cases slugs={s.cases} note={s.caseNote} /></Sec>
    <Sec title="Where"><div className="links reveal">{locations.map(l => <a key={l.slug} className="tlink" href={l.path}>{l.place}</a>)}</div></Sec>
  </Shell>
}

export function LocationPage({ slug }) {
  const l = locations.find(x => x.slug === slug)
  const area = ['new-york-city', 'manhattan', 'brooklyn'].includes(l.slug) ? { '@type': 'City', name: 'New York', containedInPlace: { '@type': 'State', name: 'New York' } } : { '@type': 'AdministrativeArea', name: `${l.place}, NY` }
  return <Shell path={l.path} title={l.title}>
    <JsonLd data={serviceLd(l, `Web and AI app development in ${l.place}`, [area])} />
    <JsonLd data={crumbs([['Home', '/'], [l.place, l.path]])} />
    <Head h1={l.h1} lede={l.lede} />
    <Sec title="What We Build"><ServiceList /></Sec>
    <Sec title="Pricing"><Prices /><p className="note reveal">{scopedNote}</p></Sec>
    <Sec title="Work We've Built"><Cases slugs={l.cases} /></Sec>
    <Sec title="Nearby"><div className="links reveal">{l.near.map(n => { const x = locations.find(y => y.slug === n); return <a key={n} className="tlink" href={x.path}>{x.place}</a> })}</div></Sec>
  </Shell>
}

const loop = [
  ['Observe', 'Watch the product and what people do with it.'],
  ['Decide', 'Pick the change most worth making.'],
  ['Build', 'Make the change in isolation.'],
  ['Verify', 'Check it in a real browser before it ships.'],
  ['Learn', 'Keep what worked for the next run.'],
]
export function Systems() {
  return <Shell path="/systems" title="System | SparkTech Studio">
    <JsonLd data={crumbs([['Home', '/'], ['System', '/systems']])} />
    <Head h1="How We Keep Your Product Working" lede="After launch, we watch your product, fix what breaks, and check every fix before it goes live." cta={false} />
    <Sec title="The Steps"><Points items={loop} /></Sec>
    <Sec title="Where It Runs"><Points items={systems.areas.map(([h, p]) => [h, p])} /></Sec>
    <Sec title="Where It Stands">
      <div className="read reveal center" style={{ marginTop: 32 }}>
        <p className="lede">{systems.status} {systems.statusLong.replace(/^Today: product fixes, running on our own site\. /, '')}</p>
        <p className="lede">People set the goals, the budget, and the limits.</p>
      </div>
    </Sec>
  </Shell>
}

export function Privacy() {
  return <Shell path="/privacy" title="Privacy | SparkTech Studio" band={false}>
    <Head h1="Privacy" lede="This site runs no analytics, no ads, and no tracking cookies." cta={false} />
    <section className="sec-tight"><div className="wrap prose">
      <h2>What We Collect</h2>
      <p>Nothing while you browse. If you email us, we get what you send.</p>
      <h2>The Assistant</h2>
      <p>If you ask the assistant in the corner a question, the conversation is sent through Vercel AI Gateway to an Anthropic Claude model so it can write a reply. The site does not save the conversation.</p>
      <h2>What We Do With It</h2>
      <p>We use what you send to reply and to talk about your project. We don’t sell it, rent it, or add you to a mailing list.</p>
      <h2>Hosting</h2>
      <p>The site is hosted on Vercel, which keeps standard server logs. Fonts are served from this site.</p>
      <h2>Deleting Your Data</h2>
      <p><a href={`mailto:${EMAIL}`}>Email us</a> and we will delete what we hold.</p>
    </div></section>
  </Shell>
}

export function NotFound() {
  return <Shell path="/404" title="Not here | SparkTech Studio">
    <section className="head wrap" style={{ paddingBottom: 'var(--section)' }}>
      <h1>That Page Isn’t Here</h1>
      <p className="lede">It may have moved, or it never existed.</p>
      <div className="actions"><a className="btn" href="/">Back to the studio</a></div>
      <ul className="nf-list">{workSlugs.map(s => { const p = products.find(x => x.slug === s); return <li key={s}><a className="tlink" href={`/work/${s}`}>{p.name}</a></li> })}</ul>
    </section>
  </Shell>
}

