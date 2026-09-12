import { Arrow, ArrowOut } from './Icons'
import './Hero.css'
import AnimatedLogo from './AnimatedLogo'
export default function Hero() {
  return <section className="hero" aria-labelledby="hero-title"><div className="wrap hero-grid">
    <div className="hero-copy"><p className="hero-kicker">Ideas. Design. Development.</p>
      <div className="hero-playground"><AnimatedLogo /><h1 id="hero-title"><span className="headline-balance">Good ideas.</span><span>Made real.</span></h1></div><p className="hero-play-hint">Scroll, drag, or tap the spark.</p>
      <p className="hero-description">We design and build websites and digital products. Bring the idea. We’ll take it from there.</p>
      <div className="hero-actions"><a className="btn" href="mailto:contactus@sparktechstudio.com">Start a project <ArrowOut /></a><a className="link" href="#work">View our work <Arrow /></a></div>
    </div>
  </div></section>
}
