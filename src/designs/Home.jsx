import { BOOK } from './content.jsx'
import { Shell, Section } from './Layout.jsx'
import { ServiceList, WorkList, Prices } from './Page.jsx'

const TITLE = 'SparkTech Studio | AI Web Apps, MVPs and Websites in NYC'

export default function Home() {
  return <Shell title={TITLE}>
    <section className="hero wrap">
      <h1>From idea to launch, fast.</h1>
      <p className="lede">An independent New York studio. We build AI web apps, MVPs, websites, and the agents that do real work for a business.</p>
      <div className="actions">
        <a className="btn btn-primary" {...BOOK}>Book a call</a>
        <a className="btn btn-line" href="/work">See what we’ve built</a>
      </div>
    </section>

    <Section title="What we build" id="services"><ServiceList /></Section>

    <Section title="What we’ve built" id="work"><WorkList /></Section>

    <Section title="Plain prices" id="pricing" intro="AI apps, agent systems and MVPs are priced in a written scope after a call.">
      <Prices />
    </Section>

    <Section title="And we keep improving it" id="systems" className="split">
      <div>
        <p className="text">Launch isn’t the finish line. We run a system that keeps what we build getting better, with people in charge of what it may touch.</p>
        <div className="actions"><a className="btn btn-line" href="/systems">How it works</a></div>
      </div>
    </Section>

    <Section title="Who’s building it" id="about" className="split">
      <p className="text">I’m Spencer Hoberman. I founded SparkTech Studio in New York, and I also build UTern, which stays an independent company.</p>
    </Section>
  </Shell>
}
