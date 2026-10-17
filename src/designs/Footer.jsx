import { built, EMAIL, CALENDLY, year } from './content.jsx'
import './buttons.css'
import './Footer.css'

// The dark site footer: the closing question, two buttons, link columns, and the legal line. Shared by the home page and the system page.
export default function Footer() {
  return <footer className="ft on-dark" id="contact">
    <div className="ft-cta">
      <h2>What should<br />exist <em>next?</em></h2>
      <div>
        <p>Tell us. Book a call, or send us an email and we reply within two business days. The first call is a real conversation, not a pitch.</p>
        <div className="ft-actions">
          <a className="btn" href={CALENDLY} target="_blank" rel="noreferrer">Book a call</a>
          <a className="btn btn-ghost" href={`mailto:${EMAIL}`}>Email us</a>
        </div>
      </div>
    </div>
    <div className="ft-grid">
      <div className="ft-brand">
        <span className="ft-mark"><img src="/logo.svg" width="18" height="18" alt="" />SparkTech Studio</span>
        <p>An independent studio in New York. We build products, then build the systems that keep them getting better.</p>
      </div>
      <nav aria-label="Studio"><p className="ft-h">Studio</p><a href="/systems">System</a><a href="/#work">What we’ve built</a><a href="#contact">Contact</a></nav>
      <nav aria-label="Work"><p className="ft-h">Work</p>{built.map(b => <a key={b.slug} href={b.url}>{b.name}</a>)}</nav>
      <nav aria-label="Contact"><p className="ft-h">Contact</p><a href={CALENDLY} target="_blank" rel="noreferrer">Book a call</a><a href={`mailto:${EMAIL}`}>Email us</a></nav>
    </div>
    <div className="ft-bottom"><span>© {year} SparkTech Studios, Inc.</span><span><a href="/privacy">Privacy</a> · New York</span></div>
  </footer>
}
