import './Hero.css'
import Typewriter from './Typewriter'
import { projects } from '../data/projects'

const liveCount = projects.filter((p) => p.status === 'live').length

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
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
        </div>

        <aside className="hero-terminal reveal" aria-label="Live project status">
          <div className="term-bar">
            <span className="term-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="term-title">status.sh</span>
          </div>
          <div className="term-body">
            <p className="ht-cmd">
              <span className="prompt-sign">spark@studio</span>:<span className="prompt-path">~</span>$ ./status.sh --all
            </p>
            <ul className="ht-list">
              {projects.map((p) => (
                <li className="ht-row" key={p.key}>
                  <span className={`ht-dot ht-dot--${p.status}`} aria-hidden="true" />
                  <span className="ht-name">{p.name}</span>
                  <span className="ht-leader" aria-hidden="true" />
                  <span className={`ht-state ht-state--${p.status}`}>{p.status}</span>
                </li>
              ))}
            </ul>
            <p className="ht-summary">
              <span className="comment"># {liveCount}/{projects.length} live · all systems go</span>
            </p>
            <p className="ht-cmd">
              <span className="prompt-sign">spark@studio</span>:<span className="prompt-path">~</span>${' '}
              <span className="tw-caret" aria-hidden="true" />
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
