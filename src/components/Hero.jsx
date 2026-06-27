import './Hero.css'
import Typewriter from './Typewriter'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <p className="prompt hero-prompt">
          <span className="prompt-sign">spark@studio</span>:<span className="prompt-path">~</span>$ ./sparktech --pitch
        </p>

        <h1 className="hero-headline">
          <Typewriter
            as="span"
            speed={42}
            startDelay={300}
            keepCursor
            text={[
              { t: 'We build the ' },
              { t: 'crazy', className: 'serif hero-em' },
              { t: ' ideas.' },
            ]}
          />
        </h1>

        <p className="hero-sub reveal">
          A custom software studio for ambitious founders. We design, build,
          and ship production web, mobile, and AI products. The ideas other
          teams call too weird or too hard, we put in front of real users in
          weeks.
        </p>

        <div className="hero-buttons reveal">
          <a href="#waitlist" className="hero-btn-primary">[ start_a_project ]</a>
          <a href="#portfolio" className="hero-link">
            see_the_work <span className="hero-arrow" aria-hidden="true">→</span>
          </a>
        </div>

        <dl className="hero-meta reveal">
          <div className="hero-meta-item">
            <dt>status</dt>
            <dd>2 products live in production</dd>
          </div>
          <div className="hero-meta-item">
            <dt>speed</dt>
            <dd>idea → shipped in weeks</dd>
          </div>
          <div className="hero-meta-item">
            <dt>stack</dt>
            <dd>web · mobile · AI · full-stack</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
