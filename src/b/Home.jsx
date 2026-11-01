import { Shell, Book, Laptop, Phone, Flow, Prices, ServiceSentence } from './Site.jsx'
import { products, client, about, scopedNote, screen } from './facts.js'

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

export default function Home() {
  return <Shell path="/" title="SparkTech Studio | AI Web Apps, MVPs and Websites in NYC">
    <section className="hero">
      <div className="wrap">
        <img className="hero-mark" src="/brand/sparktech-bolt-mark.png" width="512" height="500" alt="SparkTech Studio" fetchPriority="high" />
        <h1>From Idea to Launch, Fast.</h1>
        <p className="lede">An independent New York studio for AI web apps, MVPs, websites and agent systems.</p>
        <div className="actions"><Book /><a className="btn btn-ghost" href="#work">See the work</a></div>
        <div className="showcase" aria-label="UTern on a laptop and BallotWatch on a phone">
          <Laptop src={screen('utern', 'desktop')} alt="The UTern website, utern.ai" eager />
          <Phone slug="ballotwatch" src={screen('ballotwatch', 'mobile')} alt="The BallotWatch website on a phone, ballotwatch.io" eager />
        </div>
      </div>
    </section>

    <section className="sec work-intro center" id="work">
      <div className="wrap reveal"><h2>What We've Built</h2></div>
    </section>
    {products.map(p => <Product key={p.slug} p={p} />)}
    <Product p={client} slug="oasis" device="laptop" caseStudy={false} />

    <section className="sec center" id="services">
      <div className="wrap">
        <h2 className="reveal">Services</h2>
        <ServiceSentence />
      </div>
    </section>

    <section className="sec center" id="process">
      <div className="wrap">
        <h2 className="reveal">How It Works</h2>
        <Flow />
      </div>
    </section>

    <section className="sec" id="pricing">
      <div className="wrap">
        <h2 className="center reveal">Pricing</h2>
        <Prices />
        <p className="note">{scopedNote} <a href="/pricing">See pricing</a></p>
      </div>
    </section>

    <section className="sec center" id="about">
      <div className="wrap reveal">
        <h2>About</h2>
        <p className="lede">{about}</p>
      </div>
    </section>
  </Shell>
}
