import { workSlugs } from '../designs/content.jsx'
import { process } from '../designs/pages.jsx'
import { serviceList, clients, scoped } from './facts.js'
import { Shell, Book, CloudBg, Sec, ProductRows, List, Flow, Prices, Faq } from './ui.jsx'

const faq = [
  ['How long does a build take?', 'A website usually takes 3 to 5 weeks. Apps, MVPs and agent systems get their dates in the written scope.'],
  ['Who owns the code?', 'Ownership, access and support are spelled out in the written scope, before any work starts.'],
  ['What do you build on?', 'Next.js and React for most apps, with the AI model picked for each job.'],
  ['Do you work with agencies?', 'Yes. Studios, agencies and accelerators bring us in to build what they’ve designed or promised.'],
]

export default function Home() {
  const client = clients[0]
  return <Shell title="SparkTech Studio | AI Web Apps, MVPs and Websites in NYC" className="st-home">
    <section className="hero cloud">
      <CloudBg />
      <div>
        <h1>We Build AI Products That Work</h1>
        <p>An independent New York studio. From idea to launch, fast.</p>
        <div className="actions"><Book /><a className="btn ghost" href="/work">See our work</a></div>
      </div>
    </section>

    <Sec id="work" title="What We’ve Built" line="All four are live and in use today.">
      <ProductRows slugs={workSlugs} />
      <div className="client reveal">
        <h3>{client.name}</h3>
        <p>{client.line} <a className="tl" href={client.url} target="_blank" rel="noreferrer">{client.host}</a></p>
      </div>
    </Sec>

    <Sec id="services" title="What We Do">
      <List items={serviceList.map(s => [s.nav, s.line, s.path])} />
    </Sec>

    <Sec title="How It Runs">
      <Flow steps={process} label="How a project runs" />
    </Sec>

    <Sec id="pricing" title="Plain Prices">
      <Prices keys={['launch', 'care', 'growth']} />
      <p className="note reveal">{scoped} <a className="tl" href="/pricing">Pricing details</a></p>
    </Sec>

    <Sec id="about" title="Who Builds It">
      <p className="read center reveal" style={{ fontSize: 21, color: 'var(--ink)' }}>Spencer Hoberman founded SparkTech Studio in New York. He also builds UTern, an independent company.</p>
    </Sec>

    <Sec title="Questions">
      <Faq items={faq} />
    </Sec>
  </Shell>
}
