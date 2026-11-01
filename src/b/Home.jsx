import { Shell, Book, Laptop, Phone, Prices } from './Site.jsx'
import { products, client, scopedNote, screen } from './facts.js'

// One product, full width, its live screen in a device frame (used on /work)
export function Product({ p, slug = p.slug, device = p.device, caseStudy = true }) {
  return <section className="sec product" id={slug}>
    <div className="wrap">
      <div className="reveal">
        <h2>{p.name}</h2>
        <p className="line">{p.line}</p>
      </div>
      <div className={`stage reveal stage-${device}`}>
        {device === 'laptop'
          ? <Laptop src={screen(slug, 'desktop')} alt={`The ${p.name} website, ${p.host}`} />
          : <Phone slug={slug} src={screen(slug, 'mobile')} alt={`The ${p.name} website on a phone, ${p.host}`} />}
      </div>
      <div className="links">
        <a className="tlink" href={p.url} target="_blank" rel="noreferrer">Visit {p.host}</a>
        {caseStudy && <a className="tlink" href={`/work/${slug}`}>Read the case study</a>}
      </div>
    </div>
  </section>
}

// The work, one product per full-width row: each links to its case study, or out to the live site
export function WorkGrid({ items = [...products, client] }) {
  return <ul className="work-list">{items.map(p => {
    const href = p.slug === 'oasis' ? p.url : `/work/${p.slug}`
    const ext = p.slug === 'oasis' ? { target: '_blank', rel: 'noreferrer' } : {}
    return <li key={p.slug} className="reveal">
      <a className="case" href={href} {...ext}>
        <Laptop src={screen(p.slug, 'desktop')} alt={`The ${p.name} website, ${p.host}`} />
        <h3>{p.name}</h3>
        <p>{p.line}</p>
      </a>
    </li>
  })}</ul>
}

const what = [
  ['Websites', 'A fast site you can edit yourself.', '/services', 'See services'],
  ['AI agents', 'AI that answers, sorts and follows up for you.', '/services/ai-agents', 'See AI agents'],
]

export default function Home() {
  return <Shell path="/" title="SparkTech Studio | Websites and AI Agents in New York">
    <section className="hero">
      <div className="wrap">
        <h1>Websites And AI Agents For Your Business</h1>
        <p className="lede">We build your site and set up AI agents that do real work. New York studio.</p>
        <div className="actions"><Book /></div>
        <div className="showcase" aria-label="UTern on a laptop and BallotWatch on a phone">
          <Laptop src={screen('utern', 'desktop')} alt="The UTern website, utern.ai" eager />
          <Phone slug="ballotwatch" src={screen('ballotwatch', 'mobile')} alt="The BallotWatch website on a phone, ballotwatch.io" eager />
        </div>
      </div>
    </section>

    <section className="sec" id="services">
      <div className="wrap">
        <h2 className="center reveal">What We Do</h2>
        <ul className="what">{what.map(([h, p, href, cta]) => <li key={h} className="reveal">
          <h3>{h}</h3>
          <p>{p}</p>
          <a className="tlink" href={href}>{cta}</a>
        </li>)}</ul>
      </div>
    </section>

    <section className="sec" id="work">
      <div className="wrap">
        <h2 className="center reveal">Our Work</h2>
        <WorkGrid />
      </div>
    </section>

    <section className="sec" id="pricing">
      <div className="wrap">
        <h2 className="center reveal">Pricing</h2>
        <Prices short />
        <p className="note">{scopedNote} <a href="/pricing">See pricing</a></p>
      </div>
    </section>
  </Shell>
}
