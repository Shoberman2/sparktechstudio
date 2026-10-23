import { built, BOOKING_URL, year } from './content.jsx'
import './buttons.css'
import './NotFound.css'

// Served for any route that is not the home page or a known company page; the build also writes it as 404.html.
export default function NotFound() {
  return <div className="nf">
    <header className="nf-nav"><a href="/" className="nf-mark"><img src="/logo.svg" width="18" height="18" alt="" />Sparktech Studios</a></header>
    <main id="main" className="nf-main">
      <p className="nf-kicker">404</p>
      <h1>That page<br />isn’t <em>here.</em></h1>
      <p className="nf-lede">It may have moved, or it never existed. Everything that does is a click away.</p>
      <div className="nf-actions"><a className="btn" href="/">Back to the studio</a><a className="btn btn-ghost" href={BOOKING_URL} target="_blank" rel="noreferrer">Book a call</a></div>
      <ul className="nf-work">{built.map(b => <li key={b.slug}><a href={b.url}><strong>{b.name}</strong><span>{b.line}</span></a></li>)}</ul>
    </main>
    <footer className="nf-foot">© {year} Sparktech Studios, Inc. · New York, NY</footer>
  </div>
}
