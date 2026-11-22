import { workSlugs, pricing, EMAIL, BOOK } from '../designs/content.jsx'
import { services, industry, locations, pricingPage, partnersPage } from '../designs/pages.jsx'
import { serviceList, clients, scoped, SITE } from './facts.js'
import { Shell, PageHead, Sec, ProductRows, Client, List, Flow, Prices, Faq, Links, JsonLd } from './ui.jsx'
import { AgentMock, SearchMock } from './Mocks.jsx'
import Grader from './Grader.jsx'
import { CHECKS } from '../lib/grade.js'

// Interior pages for Direction A. Same nav, type, buttons and closing band as the home page.
const ORG = `${SITE}/#org`
const crumbs = list => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })) })
const offer = key => {
  const p = pricing[key], [lo, hi] = p.price.match(/[\d,]+k?/g).map(v => Number(v.replace(/,/g, '').replace('k', '000')))
  return { '@type': 'Offer', name: p.name, priceSpecification: { '@type': 'PriceSpecification', priceCurrency: 'USD', ...(hi ? { minPrice: lo, maxPrice: hi } : { price: lo }), ...(p.unit === 'a month' ? { unitText: 'MONTH' } : {}) } }
}
const serviceLd = (page, name, area) => {
  const keys = [page.package].flat().filter(Boolean)
  return { '@context': 'https://schema.org', '@type': 'Service', name, serviceType: name, url: `${SITE}${page.path}`, provider: { '@id': ORG }, ...(area ? { areaServed: area } : {}), ...(keys.length ? { offers: keys.map(offer) } : {}) }
}
const faqLd = items => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) })

const allServices = serviceList.map(s => [s.nav, s.line, s.path])

export function ServicePage({ slug }) {
  const s = services.find(x => x.slug === slug)
  if (slug === 'ai-agents' || slug === 'seo-aeo') return <ShortPage s={s} />
  const keys = [s.package].flat().filter(Boolean)
  return <Shell title={s.title} active="services">
    <JsonLd data={serviceLd(s, s.name)} />
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services'], [s.nav, s.path]])} />
    <JsonLd data={faqLd(s.faq)} />
    <PageHead h1={s.h1} lede={s.lede} />
    {s.points && <Sec title="What You Get"><List items={s.points} /></Sec>}
    {keys.length > 0 && <Sec title="Pricing"><Prices keys={keys} /></Sec>}
    <Sec title="Questions"><Faq items={s.faq} /></Sec>
  </Shell>
}

// The short service pages (/services/ai-agents, /services/seo-aeo): what it is, a picture of it, what we do, Book a call.
// Both state the flat $500 a month only through their FAQ (PR #5).
const short = {
  'ai-agents': { Visual: AgentMock, active: 'agents', band: 'Want An Agent On Your Team?', what: 'What An Agent Can Do', price: 'A flat $500 a month per business, no matter what you need.' },
  'seo-aeo': { Visual: SearchMock, active: 'services', band: 'Want People To Find You?', what: 'What We Do' },
}
function ShortPage({ s }) {
  const x = short[s.slug]
  return <Shell title={s.title} active={x.active} bandTitle={x.band}>
    <JsonLd data={serviceLd(s, s.name)} />
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services'], [s.nav, s.path]])} />
    {s.faq && <JsonLd data={faqLd(s.faq)} />}
    <PageHead h1={s.h1} lede={s.lede} cta={false} />
    <section className="sec mk-sec"><div className="wrap mk-solo reveal"><x.Visual /></div></section>
    <Sec title={x.what}><ul className="trio">{s.points.map(([h, p]) => <li key={h} className="reveal"><h3>{h}</h3><p>{p}</p></li>)}</ul></Sec>
    {s.how && <Sec title="How We Work"><p className="say reveal">{s.how}</p></Sec>}
    {x.price && <Sec title="Pricing"><p className="say reveal">{x.price}</p></Sec>}
    {s.faq && <Sec title="Questions"><Faq items={s.faq} /></Sec>}
  </Shell>
}

// One short paragraph per service on the hub, taken from that service page's own lede (and its "how", where it has one).
// Website updates and Monthly care share a page, so each page appears once.
const hubServices = serviceList
  .filter((x, i, all) => all.findIndex(y => y.path === x.path) === i)
  .map(x => { const s = services.find(v => v.path === x.path); return [s.name[0].toUpperCase() + s.name.slice(1), [s.lede, s.how].filter(Boolean).join(' '), x.path] })

// Hub FAQ: every answer restates facts already published elsewhere on the site (home, service pages, llms.txt).
const hubFaq = [
  ['What does SparkTech Studios do?', 'We design, build and run websites and get them found on Google and in AI answers. We also build AI agents, AI apps, web apps and startup MVPs.'],
  ['What does it cost?', 'A flat $500 a month per business, month-to-month, no matter what you need. There is no build fee.'],
  ['What is included in the $500 a month?', 'The build, maintenance and your updates.'],
  ['How do I start?', 'Book a call from any page, or email us. We reply within two business days. After the call we send a written scope: what we build, what it costs and when. Ownership, access and support are spelled out there.'],
  ['Do you build AI apps and AI agents?', 'Yes. We set up AI agents that answer customers, sort requests and follow up, with a person approving what matters. We also build AI web apps where the AI does the main job.'],
  ['Do you promise first place on Google?', 'No. We fix what holds a site back, write pages that answer real questions and make your facts easy to cite. No rankings are promised.'],
]

export function ServicesHub() {
  return <Shell title="Services | SparkTech Studios" active="services">
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services']])} />
    <JsonLd data={faqLd(hubFaq)} />
    <PageHead h1="What We Build" lede="Websites, AI agents, updates and search, plus the apps around them." cta={false} />
    <Sec><List items={allServices} /><p className="note reveal">{scoped}</p></Sec>
    <Sec title="What Each One Is"><List items={hubServices} /></Sec>
    <Sec title="Common Questions"><Faq items={hubFaq} /></Sec>
  </Shell>
}

export function IndustryPage() {
  const s = industry
  return <Shell title={s.title} active="services">
    <JsonLd data={serviceLd(s, 'Website design for law firms, financial advisors and medical practices')} />
    <JsonLd data={crumbs([['Home', '/'], ['Law, finance and medical', s.path]])} />
    <PageHead h1={s.h1} lede={s.lede} />
    <Sec title="Who It’s For"><List items={s.points} /><p className="note reveal">{s.note}</p></Sec>
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
    <Sec title="One Plain Price"><Prices keys={['site']} /><p className="note reveal">{scoped}</p></Sec>
    <Sec title="Nearby"><Links items={l.near.map(n => { const x = locations.find(y => y.slug === n); return [x.place, x.path] })} /></Sec>
  </Shell>
}

export function WorkHub() {
  return <Shell title="Work | SparkTech Studios" active="work" bandTitle="Want Something Built Like This?">
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
    <PageHead h1="One Plain Price" lede="For small businesses. No build fee, no tiers." />
    <Sec title="Small Business Website"><Prices keys={['site']} scopes={{ site: pricing.site.scope }} /></Sec>
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
  </Shell>
}

// /grader: the free website grader on its own page, then what it checks
const checkNotes = {
  mobile: 'Whether the page fits a phone screen and lets people zoom.',
  https: 'Whether the site loads over a secure connection.',
  cta: 'Whether a visitor can see how to call, email, book or buy.',
  alt: 'Whether images have the descriptions Google and screen readers rely on.',
  schema: 'Whether the page labels your business details for Google and AI tools.',
  ai: 'Whether ChatGPT, Claude, Perplexity and Google AI are allowed to read the site.',
  links: 'Whether the links on the homepage lead somewhere.',
  title: 'The headline people see in Google and on the browser tab.',
  description: 'The two lines under your name in search results.',
  h1: 'One clear heading that says what the page is about.',
  og: 'What shows when someone texts or posts your link.',
  entity: 'Whether your structured data says who you are (name, website, phone, email, address) in a form AI answers can quote.',
  text: 'Whether your words are in the page itself. Most AI crawlers do not run JavaScript.',
  faq: 'Whether the page answers the questions people ask AI tools, ideally with FAQ structured data.',
  llms: 'Whether you have an llms.txt file, a plain summary of your business for AI tools.',
}
export function GraderPage() {
  return <Shell title="Free SEO and AEO Checker | SparkTech Studios" active="grader" bandTitle="Want Us To Fix Your Site?">
    <JsonLd data={crumbs([['Home', '/'], ['SEO and AEO checker', '/grader']])} />
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'SparkTech SEO and AEO Checker', url: `${SITE}/grader`, applicationCategory: 'BusinessApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' }, provider: { '@id': ORG } }} />
    <PageHead h1="Free SEO And AEO Checker" lede="Enter your address. Get an SEO score for Google, an AEO score for AI answers and a list of fixes, ranked by what matters most. No email needed." cta={false}>
      <Grader where="page" />
    </PageHead>
    <Sec title="What We Check For Google"><List items={CHECKS.filter(c => c.group === 'seo').map(c => [c.label, checkNotes[c.id]])} /></Sec>
    <Sec title="What We Check For AI Answers"><List items={CHECKS.filter(c => c.group === 'aeo').map(c => [c.label, checkNotes[c.id]])} /></Sec>
  </Shell>
}

// What this site actually does with data, and nothing more. Update if analytics, a form, or any third party is added.
export function Privacy() {
  return <Shell title="Privacy | SparkTech Studios" bandTitle="Questions About Your Data?" bandLine="Email us and a person will answer within two business days.">
    <PageHead h1="Privacy Kept Simple" lede="No ads and no tracking cookies. We count page views without knowing who you are." cta={false} />
    <section className="sec"><div className="wrap prose">
      <h2>What We Collect</h2>
      <p>While you browse, Vercel Web Analytics counts page views and button clicks. It sets no cookies and does not identify you. If you email us, we get what you send. If you book a call, Calendly collects your name, email, and the time you pick, under <a href="https://calendly.com/privacy" target="_blank" rel="noreferrer">Calendly’s privacy policy</a>, and shares the booking with us.</p>
      <h2>The Website Grader</h2>
      <p>When you grade a site, our server fetches that site’s public homepage, its robots.txt and its llms.txt. We don’t keep the address or the result. The full report is shown on the page, and we never ask for your email.</p>
      <h2>What We Do With It</h2>
      <p>We use it to reply and to talk about your project. We don’t sell it, rent it, or add you to a mailing list.</p>
      <h2>Hosting</h2>
      <p>The site is hosted on Vercel, which keeps standard server logs. Fonts are served from this site.</p>
      <h2>Deleting Your Data</h2>
      <p><a href={`mailto:${EMAIL}`}>Email us</a> and we will delete what we hold.</p>
    </div></section>
  </Shell>
}

// Terms of use for the website (2026-11-21). Plain, general terms for a studio's marketing site, written by us and
// TODO(Spencer): have a lawyer review before relying on it. No governing-law or liability-cap clause: that is his call.
export function Terms() {
  return <Shell title="Terms | SparkTech Studios" bandTitle="Questions About These Terms?" bandLine="Email us and a person will answer within two business days.">
    <PageHead h1="Terms Of Use" lede="The ground rules for using this website. Project work is covered by its own written scope." cta={false} />
    <section className="sec"><div className="wrap prose">
      <h2>Who We Are</h2>
      <p>This site is run by SparkTech Studios, Inc. By using it you agree to these terms.</p>
      <h2>Using The Site</h2>
      <p>You can browse, read and share links to any page. Please don’t try to break the site, overload it, or use it to send spam or anything unlawful.</p>
      <h2>The SEO Checker</h2>
      <p>The checker reads a site’s public homepage and gives a score and a list of suggested fixes. It’s general guidance, not a guarantee of rankings or results. Only check sites you’re allowed to check.</p>
      <h2>Our Work And Words</h2>
      <p>The text, designs and images on this site belong to SparkTech Studios unless they say otherwise. Other companies’ names and marks belong to their owners.</p>
      <h2>Projects</h2>
      <p>Nothing on this site is an offer or a contract. What we build, what it costs, when, and who owns what are set in a written scope that we both agree to before work starts.</p>
      <h2>Links Elsewhere</h2>
      <p>Some links go to other sites, like Calendly for booking a call. Those sites have their own terms.</p>
      <h2>No Promises Beyond This Page</h2>
      <p>We work to keep the site accurate and up, but it’s provided as is, and we may change it or these terms at any time. The latest version always lives on this page.</p>
      <h2>Contact</h2>
      <p><a href={`mailto:${EMAIL}`}>Email us</a> with any question about these terms.</p>
    </div></section>
  </Shell>
}

export function NotFound() {
  return <Shell title="Not here | SparkTech Studios" bandTitle="Have Something To Build?">
    <section className="phead"><div className="wrap">
      <h1>That Page Isn’t Here</h1>
      <p>It may have moved, or it never existed.</p>
      <div className="actions"><a className="btn" href="/">Back to the studio</a><a className="btn ghost" {...BOOK}>Book a call</a></div>
    </div></section>
    <Sec title="Try These"><Links items={[['Services', '/#services'], ['Pricing', '/#pricing'], ['SEO and AEO checker', '/grader']]} /></Sec>
  </Shell>
}

