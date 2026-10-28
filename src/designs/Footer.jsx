import { built, EMAIL, CALENDLY, year } from './content.jsx'
import { services, industry, locations } from './pages.jsx'
import './buttons.css'
import './Footer.css'

// The dark site footer: the closing question, two buttons, link columns, the places we serve, and the legal line. Shared by every white page.
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
        <p>An independent studio in New York, NY. AI web apps, MVPs and websites, and the systems that keep them getting better.</p>
      </div>
      <nav aria-label="Services"><p className="ft-h">Services</p>{services.map(s => <a key={s.slug} href={s.path}>{s.nav}</a>)}<a href={industry.path}>Law, finance and medical</a></nav>
      <nav aria-label="Work"><p className="ft-h">Work</p><a href="/work">All work</a>{built.map(b => <a key={b.slug} href={b.url}>{b.name}</a>)}</nav>
      <nav aria-label="Studio"><p className="ft-h">Studio</p><a href="/systems">System</a><a href={CALENDLY} target="_blank" rel="noreferrer">Book a call</a><a href={`mailto:${EMAIL}`}>Email us</a></nav>
    </div>
    <nav className="ft-places" aria-label="Where we work">{locations.map(l => <a key={l.slug} href={l.path}>{l.place}</a>)}</nav>
    <div className="ft-bottom"><span>© {year} SparkTech Studios, Inc.</span><span><a href="/privacy">Privacy</a> · New York</span></div>
  </footer>
}
