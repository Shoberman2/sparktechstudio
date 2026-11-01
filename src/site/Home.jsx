import { workSlugs } from '../designs/content.jsx'
import { pricing, clients } from './facts.js'
import { Shell, Book, Sec, ProductRows, Client } from './ui.jsx'

// Home, after Spencer's 2026-10-31 feedback: say what we do in one sentence, then show real work, a price, and Book a call.
const what = [
  ['Websites', 'A fast, clear site that gets you calls.', '/services', 'See services'],
  ['AI agents', 'AI that answers, sorts and follows up for you.', '/services/ai-agents', 'How AI agents work'],
]

export default function Home() {
  const site = pricing.launch
  return <Shell title="SparkTech Studio | Websites and AI Agents in New York" className="st-home">
    <section className="hero">
      <div>
        <h1>Websites And AI Agents For Your Business</h1>
        <p>We build your site and set up AI agents that do real work. New York studio.</p>
        <div className="actions"><Book /></div>
      </div>
    </section>

    <Sec id="services" title="What We Do">
      <ul className="duo">{what.map(([h, p, href, label]) => <li key={h} className="reveal">
        <h3>{h}</h3><p>{p}</p><a className="tl" href={href}>{label}</a>
      </li>)}</ul>
    </Sec>

    <Sec id="work" title="Our Work">
      <ProductRows slugs={workSlugs} />
      <Client c={clients[0]} />
    </Sec>

    <Sec id="pricing" title="Pricing">
      <ul className="duo">
        <li className="reveal"><h3>Website</h3><span className="amt num">{site.price}</span><p>One time. Usually 3 to 5 weeks.</p></li>
        <li className="reveal"><h3>AI agents</h3><span className="amt">After a call</span><p>Priced for the job you need done.</p></li>
      </ul>
      <p className="note reveal"><a className="tl" href="/pricing">All prices</a></p>
    </Sec>
  </Shell>
}
