import { companies, studies, EMAIL } from '../designs/content.jsx'
import { services, industry, locations, pricingPage, partnersPage } from '../designs/pages.jsx'
import { Shell, Statement, PageHead, Ask, List2, Flow, Prices, Screens, Book, Btn, JsonLd } from './ui.jsx'
import { crumbs, faqLd, serviceLd } from './ld.js'
import { work, scoped } from './copy.js'

// One short line per service
const svcLines = {
  'ai-app-development': 'Apps where AI does the work.',
  'ai-agents': 'Agents that do real work for your business.',
  'web-app-development': 'Dashboards, portals and tools.',
  'web-design': 'Fast sites that turn visits into calls.',
  'startup-mvp': 'A first version real people can use.',
  retainers: 'We keep it fast, fixed and up to date.',
}
const svcItems = () => services.map(s => [s.nav, svcLines[s.slug], s.path])

export function Home() {
  return <Shell path="/" title="SparkTech Studio | Websites and AI Agents for Business">
    <section className="hero">
      <div className="wrap">
        <h1>Websites And AI Agents For Your Business</h1>
        <p className="lede">We build your site and set up AI agents that do real work. New York studio.</p>
        <div className="actions"><Book /><Btn ghost href="/work">See our work</Btn></div>
      </div>
    </section>
    <Statement id="services" title="What We Do">
      <List2 items={[['Websites', 'Fast sites that turn visits into calls.', '/services'], ['AI agents', 'Agents that answer, sort and follow up for you.', '/services/ai-agents']]} />
    </Statement>
    <Statement id="work" title="Our Work">
      <Screens withClient />
    </Statement>
    <Statement id="pricing" title="Pricing" line={scoped}>
      <Prices withScope={false} />
    </Statement>
    <Ask />
  </Shell>
}

const Section = ({ children }) => <section className="sec"><div className="wrap reveal">{children}</div></section>
const Faq = ({ items }) => <div className="faq">{items.map(([q, a]) => <div key={q}><h3>{q}</h3><p>{a}</p></div>)}</div>
const Links = ({ items }) => <nav className="links">{items.map(([l, h]) => <a key={h} href={h}>{l}</a>)}</nav>

export function ServicePage({ slug }) {
  const s = services.find(x => x.slug === slug)
  if (slug === 'ai-agents') return <AgentsPage s={s} />
  const pkg = [s.package].flat().filter(Boolean)
  // With a price shown, the cost question would say the same thing twice
  const faq = pkg.length ? s.faq.slice(1) : s.faq
  return <Shell path={s.path} title={s.title}>
    <JsonLd data={serviceLd(s, s.kicker)} />
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services'], [s.nav, s.path]])} />
    <JsonLd data={faqLd(faq)} />
    <PageHead h1={s.h1} lede={s.lede} />
    <Statement title="What You Get"><List2 items={s.points} /></Statement>
    {pkg.length > 0 && <Statement title="The Price"><Prices keys={pkg} withScope={false} /></Statement>}
    <Statement title="Work Like This"><Screens slugs={s.cases} /></Statement>
    <Statement title="Questions"><Faq items={faq} /></Statement>
    <Ask />
  </Shell>
}

function AgentsPage({ s }) {
  return <Shell path={s.path} title={s.title}>
    <JsonLd data={serviceLd(s, s.kicker)} />
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services'], [s.nav, s.path]])} />
    <PageHead h1={s.h1} lede={s.lede} />
    <Statement title="What An Agent Can Do"><List2 three items={s.points} /></Statement>
    <Statement title="How We Work" line="We start with one task, test it with you, and you approve what it can touch." />
    <Statement title="Pricing" line={s.priceNote} />
    <Ask title="Want An Agent On Your Team?" />
  </Shell>
}

export function ServicesHub() {
  return <Shell path="/services" title="Services | SparkTech Studio">
    <JsonLd data={crumbs([['Home', '/'], ['Services', '/services']])} />
    <PageHead h1="What We Do" lede="Websites and AI agents, plus the apps around them." />
    <Section><List2 items={svcItems()} /></Section>
    <Ask />
  </Shell>
}

export function IndustryPage() {
  const s = industry
  return <Shell path={s.path} title={s.title}>
    <JsonLd data={serviceLd(s, 'Website design for law firms, financial advisors and medical practices')} />
    <JsonLd data={crumbs([['Home', '/'], ['Law, finance and medical', s.path]])} />
    <PageHead h1={s.h1} lede={s.lede} />
    <Statement title="Who It’s For" line={s.note}><List2 items={s.points} /></Statement>
    <Statement title="Plain Prices"><Prices /></Statement>
    <Statement title="Work Like This" line={s.caseNote}><Screens slugs={s.cases} /></Statement>
    <Statement title="Where We Work"><Links items={locations.map(l => [l.place, l.path])} /></Statement>
    <Ask />
  </Shell>
}

export function LocationPage({ slug }) {
  const l = locations.find(x => x.slug === slug)
  const area = ['new-york-city', 'manhattan', 'brooklyn'].includes(l.slug) ? { '@type': 'City', name: 'New York', containedInPlace: { '@type': 'State', name: 'New York' } } : { '@type': 'AdministrativeArea', name: `${l.place}, NY` }
  return <Shell path={l.path} title={l.title}>
    <JsonLd data={serviceLd(l, `Web and AI app development in ${l.place}`, [area])} />
    <JsonLd data={crumbs([['Home', '/'], [l.place, l.path]])} />
    <PageHead h1={l.h1} lede={l.lede} />
    <Section><List2 items={svcItems()} /></Section>
    <Statement title="Plain Prices" line={scoped}><Prices /></Statement>
    <Statement title="Work Like This"><Screens slugs={l.cases} /></Statement>
    <Statement title="Nearby"><Links items={l.near.map(n => { const x = locations.find(y => y.slug === n); return [x.place, x.path] })} /></Statement>
    <Ask />
  </Shell>
}

export function WorkHub() {
  return <Shell path="/work" title="Work | SparkTech Studio">
    <JsonLd data={crumbs([['Home', '/'], ['Work', '/work']])} />
    <PageHead h1="Our Work" lede="Our own products, live today, and a client site." cta={false} />
    <Section><Screens withClient /></Section>
    <Ask title="Want Something Like This?" />
  </Shell>
}

export function PricingPage() {
  const s = pricingPage
  return <Shell path={s.path} title={s.title}>
    <JsonLd data={crumbs([['Home', '/'], ['Pricing', s.path]])} />
    <PageHead h1="Plain Prices" lede={scoped} />
    <Section><Prices scopes={s.scopes} /></Section>
    <Ask title="Want a Number for Your Project?" />
  </Shell>
}

const partnerFlow = [
  ['Call', 'The work, the client, how you run it.'],
  ['Written scope', 'Who talks to the client, credit and support.'],
  ['Build and launch', 'You see the work as it happens.'],
  ['Keep improving', 'Optional retainer after launch.'],
]
export function PartnersPage() {
  const s = partnersPage
  return <Shell path={s.path} title={s.title}>
    <JsonLd data={crumbs([['Home', '/'], ['Partners', s.path]])} />
    <PageHead h1={s.h1} lede={s.lede} />
    <Statement title="Who It’s For"><List2 items={s.who} /></Statement>
    <Statement title="How It Runs"><Flow steps={partnerFlow} /></Statement>
    <Statement title="What We’ve Built"><Screens /></Statement>
    <Ask title="Have a Client or a Cohort in Mind?" />
  </Shell>
}

const loop = [['Observe', 'See what is really happening.'], ['Decide', 'Pick one thing worth improving.'], ['Build', 'Make the change, inside set limits.'], ['Verify', 'Test it in a real browser.'], ['Learn', 'Remember it for next time.']]
const keeps = [['People set the limits', 'What it may touch, what it may spend, and for how long.'], ['Nothing ships unverified', 'Every change is tested before it goes live.'], ['Every run is on the record', 'What it saw, what it changed, what it learned.']]
export function SystemsPage() {
  return <Shell path="/systems" title="System | SparkTech Studio">
    <JsonLd data={crumbs([['Home', '/'], ['System', '/systems']])} />
    <PageHead h1="We Keep Improving It After Launch" lede="After launch, we keep checking, fixing and testing your site." />
    <Statement title="One Loop, on Repeat" line="After the last step, it starts again."><Flow steps={loop} /></Statement>
    <Statement title="What Never Changes"><List2 items={keeps} /></Statement>
    <Statement title="Where This Stands" line="Today the loop runs on our own site. On October 11, 2026 it found a bug there, fixed it and shipped the fix. Our products are next, one at a time." />
    <Ask />
  </Shell>
}

const marks = { utern: '/work/utern/birdee.webp', leed: '/brand/leed.svg', ballotwatch: '/brand/ballotwatch.svg', validate: '/brand/validate.svg' }

export function CaseStudy({ slug }) {
  const c = companies.find(x => x.slug === slug), st = studies[slug], shot = st ? [`/work/${slug}/og.jpg`, `The ${c.name} site`] : null
  return <Shell path={`/work/${slug}`} title={`${c.name} | SparkTech Studio`}>
    <JsonLd data={crumbs([['Home', '/'], ['Work', '/work'], [c.name, `/work/${slug}`]])} />
    <section className="page-head">
      <div className="wrap">
        {marks[slug] && <img className="co-mark" src={marks[slug]} alt="" height="72" />}
        <h1>{c.name}</h1>
        <p className="lede">{c.lede}</p>
        <div className="actions"><Book />{c.url && <Btn ghost href={c.url} target="_blank" rel="noreferrer">Visit {c.host}</Btn>}</div>
      </div>
    </section>
    {shot && <div className="frame reveal"><img src={shot[0]} alt={shot[1]} width="1200" height="630" /></div>}
    {st ? <>
      <Statement title="The Problem" line={st.problem} />
      <Statement title="What We Built"><ul className="bullets">{st.built.map(b => <li key={b}>{b}</li>)}</ul></Statement>
      <Statement title="Built With" line={`${st.stack}. ${st.status}`} />
      <Statement title="More Work"><Screens slugs={work.filter(s => s !== slug)} /></Statement>
    </> : <Statement title="In the Preview"><ul className="bullets">{c.today.map(b => <li key={b}>{b}</li>)}</ul></Statement>}
    <Ask title="Want Something Like This?" />
  </Shell>
}

export function Privacy() {
  return <Shell path="/privacy" title="Privacy | SparkTech Studio">
    <PageHead h1="Privacy, Kept Simple" lede="This site runs no analytics, no ads and no tracking cookies." cta={false} />
    <section className="sec"><div className="wrap prose">
      <h2>What we collect</h2>
      <p>Nothing while you browse. If you email us, we get what you send. If you book a call, the booking tool collects your name, email and the time you pick, and shares the booking with us.</p>
      <h2>The assistant</h2>
      <p>If you ask the assistant in the corner a question, your messages are sent through Vercel’s AI Gateway to an AI model to write the answer. We don’t store the conversation, and it closes when you leave the page.</p>
      <h2>What we do with it</h2>
      <p>We use what you send to reply and to talk about your project. We don’t sell it, rent it or add you to a mailing list.</p>
      <h2>Hosting</h2>
      <p>The site is hosted on Vercel, which keeps standard server logs. Fonts are served from this site.</p>
      <h2>Deleting your data</h2>
      <p><a href={`mailto:${EMAIL}`}>Email us</a> and we will delete what we hold.</p>
    </div></section>
  </Shell>
}

export function NotFound() {
  return <Shell path="/404" title="Not here | SparkTech Studio">
    <section className="page-head">
      <div className="wrap">
        <h1>That Page Isn’t Here</h1>
        <p className="lede">It may have moved, or it never existed.</p>
        <div className="actions"><Btn href="/">Back to the studio</Btn><Btn ghost href="/work">See the work</Btn></div>
      </div>
    </section>
    <section className="sec"><div className="wrap"><Screens /></div></section>
  </Shell>
}
