import { CALENDLY, EMAIL } from './content.jsx'
import Footer from './Footer.jsx'
import WorkTiles from './WorkTiles.jsx'
import './buttons.css'
import './Systems.css'
import './Services.css'

// What we build and for whom, in plain words. Built on the /systems shell (.sy) so the two pages read as one site.
const offers = [
  ['Web apps', 'Customer portals, dashboards, booking and ordering systems, internal tools.'],
  ['Mobile apps', 'iOS and Android apps, from MVP to App Store launch.'],
  ['Websites that convert', 'Fast, search-friendly sites for small businesses, with booking, ordering, and contact flows built in.'],
  ['AI features', <>Assistants, search, and automation that fit your product, like Birdee in <a href="/work/utern">UTern</a> and Budzy in <a href="/work/budtender">Budtender</a>.</>],
  ['Ongoing improvement', <>After launch we keep measuring and shipping improvements. <a href="/systems">How it works</a>.</>],
]
const clients = [
  ['Startups', 'You need a working product, not a slide deck: an MVP, a v1 launch, or a rebuild.'],
  ['Small businesses in NYC and Long Island', 'You need a real website, online booking or ordering, or a custom tool to replace spreadsheets and phone calls.'],
]
const steps = [
  ['Intro call', 'Free. We talk about the problem, not a pitch.'],
  ['Scope and quote', 'A fixed scope, timeline, and price, in writing.'],
  ['Build', 'Weekly demos, so you see progress every week.'],
  ['Launch and improve', 'An optional ongoing plan keeps it getting better.'],
]

export default function Services() {
  return <div className="sy sv">
    <header className="sy-nav">
      <a href="/" className="sy-mark"><img src="/logo.svg" width="18" height="18" alt="" />Sparktech Studios</a>
      <nav><a href="/systems">System</a><a href="/services" aria-current="page">Services</a><a href="/#work">Work</a><a href="#contact">Contact</a></nav>
    </header>
    <main id="main">
      <section className="sy-hero">
        <p className="sy-kicker">Services</p>
        <h1>Custom app and web development for startups and <em>small businesses</em></h1>
        <p className="sy-lede">Sparktech Studios is a product studio in New York. We design, build, and launch web apps, mobile apps, and websites, then keep making them better after launch.</p>
        <div className="sv-actions">
          <a className="btn" href={CALENDLY} target="_blank" rel="noreferrer">Book a call</a>
          <a className="btn btn-ghost" href="#work">See our work</a>
        </div>
      </section>

      <section className="sv-block" aria-labelledby="build-title">
        <div className="sy-head">
          <h2 id="build-title">What we <em>build.</em></h2>
          <p>One studio from the first sketch to launch day and after it.</p>
        </div>
        <ul className="sy-keeplist sv-cards">
          {offers.map(([title, copy]) => <li key={title}><h3>{title}</h3><p>{copy}</p></li>)}
        </ul>
      </section>

      <section className="sv-block" aria-labelledby="who-title">
        <div className="sy-head">
          <h2 id="who-title">Who we <em>work with.</em></h2>
        </div>
        <ul className="sy-keeplist sv-cards sv-two">
          {clients.map(([title, copy]) => <li key={title}><h3>{title}</h3><p>{copy}</p></li>)}
        </ul>
      </section>

      <section className="sv-block" aria-labelledby="how-title">
        <div className="sv-how">
          <h2 id="how-title">How an engagement <em>works.</em></h2>
          <ol className="sy-steps">
            {steps.map(([name, copy], i) => <li key={name}><span className="sy-n">0{i + 1}</span><div><h3>{name}</h3><p>{copy}</p></div></li>)}
          </ol>
        </div>
        {/* TODO(Spencer): "Projects typically start at $X" */}
      </section>

      <section className="sv-block" id="work" aria-labelledby="work-title">
        <div className="sy-head">
          <h2 id="work-title">Recent <em>work.</em></h2>
          <p>Products we designed and built, each on its own ground.</p>
        </div>
        <WorkTiles />
      </section>

      <section className="sv-block sv-ask" id="contact" aria-labelledby="ask-title">
        <h2 id="ask-title">Have something that should <em>exist?</em></h2>
        <div className="sv-actions">
          <a className="btn" href={CALENDLY} target="_blank" rel="noreferrer">Book a call</a>
          <a className="btn btn-ghost" href={`mailto:${EMAIL}`}>Email us</a>
        </div>
      </section>
    </main>
    <Footer cta={false} />
  </div>
}
