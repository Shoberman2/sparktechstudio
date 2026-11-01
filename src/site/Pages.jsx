import { companies, workSlugs, pricing, EMAIL, BOOK } from '../designs/content.jsx'
import { services, industry, locations, pricingPage, partnersPage } from '../designs/pages.jsx'
import { serviceList, clients, scoped, SITE } from './facts.js'
import { Shell, PageHead, Sec, ProductRows, Client, List, Flow, Prices, Faq, Links, JsonLd } from './ui.jsx'

// Interior pages for Direction A. Same nav, type, buttons and closing band as the home page.
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

const allServices = serviceList.map(s => [s.nav, s.line, s.path])

export function ServicePage({ slug }) {
  const s = services.find(x => x.slug === slug)
  if (slug === 'ai-agents') return <AgentsPage s={s} />
  const keys = [s.package].flat().filter(Boolean)
  return <Shell title={s.title} active="services">
    <JsonLd data={serviceLd(s, s.name)} />
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services'], [s.nav, s.path]])} />
    <JsonLd data={faqLd(s.faq)} />
    <PageHead h1={s.h1} lede={s.lede} />
    {s.points && <Sec title="What You Get"><List items={s.points} /></Sec>}
    {keys.length > 0 && <Sec title="Pricing"><Prices keys={keys} /></Sec>}
    <Sec title="Our Work"><ProductRows slugs={s.cases} /></Sec>
    <Sec title="Questions"><Faq items={s.faq} /></Sec>
  </Shell>
}

// /services/ai-agents: what an agent does for a business in three lines, how we work in one, the price note, Book a call.
function AgentsPage({ s }) {
  return <Shell title={s.title} active="agents" bandTitle="Want An Agent On Your Team?">
    <JsonLd data={serviceLd(s, s.name)} />
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services'], [s.nav, s.path]])} />
    <JsonLd data={faqLd(s.faq)} />
    <PageHead h1={s.h1} lede={s.lede} cta={false} />
    <Sec title="What An Agent Can Do"><ul className="trio">{s.points.map(([h, p]) => <li key={h} className="reveal"><h3>{h}</h3><p>{p}</p></li>)}</ul></Sec>
    <Sec title="How We Work"><p className="say reveal">{s.how}</p></Sec>
    <Sec title="Pricing"><p className="say reveal">Priced after a call, for the one job you want done first.</p></Sec>
  </Shell>
}

export function ServicesHub() {
  return <Shell title="Services | SparkTech Studio" active="services">
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services']])} />
    <PageHead h1="What We Build" lede="Websites and AI agents, plus the apps around them." cta={false} />
    <Sec><List items={allServices} /><p className="note reveal">Websites are {pricing.launch.price}. {scoped} <a className="tl" href="/pricing">All prices</a></p></Sec>
  </Shell>
}

export function IndustryPage() {
  const s = industry
  return <Shell title={s.title} active="services">
    <JsonLd data={serviceLd(s, 'Website design for law firms, financial advisors and medical practices')} />
    <JsonLd data={crumbs([['Home', '/'], ['Law, finance and medical', s.path]])} />
    <PageHead h1={s.h1} lede={s.lede} />
    <Sec title="Who It’s For"><List items={s.points} /><p className="note reveal">{s.note}</p></Sec>
    <Sec title="Plain Prices"><Prices keys={['launch', 'care', 'growth']} /></Sec>
    <Sec title="Work We’ve Built" line={s.caseNote}><ProductRows slugs={s.cases} /></Sec>
    <Sec title="Where We Work"><Links items={locations.map(l => [l.place, l.path])} /></Sec>
  </Shell>
}

export function LocationPage({ slug }) {
  const l = locations.find(x => x.slug === slug)
  const area = ['new-york-city', 'manhattan', 'brooklyn'].includes(l.slug) ? { '@type': 'City', name: 'New York', containedInPlace: { '@type': 'State', name: 'New York' } } : { '@type': 'AdministrativeArea', name: `${l.place}, NY` }
  return <Shell title={l.title}>
    <JsonLd data={serviceLd(l, `Web and AI app development in ${l.place}`, [area])} />
    <JsonLd data={crumbs([['Home', '/'], [l.place, l.path]])} />
    <PageHead h1={l.h1} lede={l.lede} />
    <Sec title="What We Build"><List items={allServices} /></Sec>
    <Sec title="Plain Prices"><Prices keys={['launch', 'care', 'growth']} /><p className="note reveal">{scoped}</p></Sec>
    <Sec title="Work We’ve Built"><ProductRows slugs={l.cases} /></Sec>
    <Sec title="Nearby"><Links items={l.near.map(n => { const x = locations.find(y => y.slug === n); return [x.place, x.path] })} /></Sec>
  </Shell>
}

export function WorkHub() {
  return <Shell title="Work | SparkTech Studio" active="work" bandTitle="Want Something Built Like This?">
    <JsonLd data={crumbs([['Home', '/'], ['Work', '/work']])} />
    <PageHead h1="Our Work" lede="Products we built and run, and sites we built for clients." cta={false} />
    <Sec><ProductRows slugs={workSlugs} /></Sec>
    <Sec title="For Clients"><Client c={clients[0]} /></Sec>
  </Shell>
}

export function PricingPage() {
  const s = pricingPage
  return <Shell title={s.title} active="pricing" bandTitle="Want A Number For Your Project?">
    <JsonLd data={crumbs([['Home', '/'], ['Pricing', s.path]])} />
    <PageHead h1="Plain Prices" lede="One website package and two monthly retainers." />
    <Sec title="Website"><Prices keys={['launch']} scopes={{ launch: pricing.launch.scope }} /></Sec>
    <Sec title="After Launch"><Prices keys={['care', 'growth']} scopes={s.scopes} /></Sec>
    <Sec title="Everything Else"><p className="read center reveal" style={{ fontSize: 19 }}>{scoped} No two are the same size.</p></Sec>
  </Shell>
}

export function PartnersPage() {
  const s = partnersPage
  return <Shell title={s.title} active="partners" bandTitle="Have A Client Or A Cohort In Mind?">
    <JsonLd data={crumbs([['Home', '/'], ['Partners', s.path]])} />
    <PageHead h1={s.h1} lede={s.lede} />
    <Sec title="Who It’s For"><List items={s.who} /></Sec>
    <Sec title="What We Build"><Links items={serviceList.map(x => [x.nav, x.path])} /></Sec>
    <Sec title="How It Runs"><Flow steps={s.how} label="How a partner project runs" /></Sec>
    <Sec title="Work We’ve Built"><ProductRows slugs={workSlugs} /></Sec>
  </Shell>
}

// What this site actually does with data, and nothing more. Update if analytics, a form, or any third party is added.
export function Privacy() {
  return <Shell title="Privacy | SparkTech Studio" band={false}>
    <PageHead h1="Privacy, Kept Simple" lede="This site runs no analytics, no ads, and no tracking cookies." cta={false} />
    <section className="sec"><div className="wrap prose">
      <h2>What We Collect</h2>
      <p>Nothing while you browse. If you email us, we get what you send. If you book a call, Calendly collects your name, email, and the time you pick, under <a href="https://calendly.com/privacy" target="_blank" rel="noreferrer">Calendly’s privacy policy</a>, and shares the booking with us.</p>
      <h2>The Assistant</h2>
      <p>If you ask the assistant in the corner a question, what you type is sent to an AI model through Vercel’s AI Gateway to write the reply. We don’t keep the conversation or use it to contact you.</p>
      <h2>What We Do With It</h2>
      <p>We use it to reply and to talk about your project. We don’t sell it, rent it, or add you to a mailing list.</p>
      <h2>Hosting</h2>
      <p>The site is hosted on Vercel, which keeps standard server logs. Fonts are served from this site.</p>
      <h2>Deleting Your Data</h2>
      <p><a href={`mailto:${EMAIL}`}>Email us</a> and we will delete what we hold.</p>
    </div></section>
  </Shell>
}

export function NotFound() {
  return <Shell title="Not here | SparkTech Studio" bandTitle="Have Something To Build?">
    <section className="phead"><div className="wrap">
      <h1>That Page Isn’t Here</h1>
      <p>It may have moved, or it never existed.</p>
      <div className="actions"><a className="btn" href="/">Back to the studio</a><a className="btn ghost" {...BOOK}>Book a call</a></div>
    </div></section>
    <Sec title="Try These"><Links items={[['Services', '/services'], ['Work', '/work'], ['Pricing', '/pricing'], ...companies.filter(c => workSlugs.includes(c.slug)).map(c => [c.name, `/work/${c.slug}`])]} /></Sec>
  </Shell>
}

