import { workSlugs } from '../designs/content.jsx'
import { products, clients } from './facts.js'
import { Shell, Book, Sec, Prices } from './ui.jsx'
import { SiteMock, AgentMock, UpdateMock, SearchMock } from './Mocks.jsx'

// Home, Direction A built out (2026-11-01): hero, then one panel per service with a concrete picture of the work,
// alternating text and visual. Work stays compact here (the full rows live on /work), then prices and Book a call.
const panels = [
  ['Websites', 'A fast, clear site that turns visits into calls.', '/services/web-design', 'See websites', SiteMock],
  ['AI Agents', 'AI that answers customers, sorts requests and logs leads for you.', '/services/ai-agents', 'How AI agents work', AgentMock],
  ['Website Updates', 'Send us a change and we make it.', '/services/retainers', 'See website updates', UpdateMock],
  ['SEO And AEO', 'Get found on Google and in AI answers like ChatGPT and Perplexity.', '/services/seo-aeo', 'See SEO and AEO', SearchMock],
]

export default function Home() {
  return <Shell title="SparkTech Studio | Websites and AI Agents in New York" className="st-home">
    <section className="hero">
      <div>
        <h1>Websites And AI Agents For Your Business</h1>
        <p>We build your site, set up AI that does real work, and help people find you. New York studio.</p>
        <div className="actions"><Book /></div>
      </div>
    </section>

    <section className="sec" id="services" aria-label="What we do">
      <div className="wrap">
        <ul className="rows panels">{panels.map(x => { const [h, p, href, label, Visual] = x; return <li key={h} className="row reveal">
          <div className="row-text">
            <h2>{h}</h2>
            <p>{p}</p>
            <div className="row-links"><a className="tl" href={href}>{label}</a></div>
          </div>
          <Visual />
        </li> })}</ul>
      </div>
    </section>

    <Sec id="work" title="What We’ve Built" line="Our own products, plus sites for clients.">
      <ul className="links reveal">
        {workSlugs.map(s => { const p = products.find(x => x.slug === s); return <li key={s}><a href={`/work/${s}`}>{p.name}</a></li> })}
        {clients.map(c => <li key={c.name}><a href={c.url} target="_blank" rel="noreferrer">{c.name}</a></li>)}
      </ul>
      <p className="note reveal"><a className="tl" href="/work">See all our work</a></p>
    </Sec>

    <Sec id="pricing" title="Pricing">
      <Prices keys={['monthly']} />
      <p className="note reveal"><a className="tl" href="/pricing">All prices</a></p>
    </Sec>
  </Shell>
}
