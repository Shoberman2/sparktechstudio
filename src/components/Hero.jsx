import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-media" aria-hidden="true">
        <img
          className="hero-still"
          src="/transistor.jpg"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-scrim" />
      </div>

      <div className="hero-inner">
        <p className="prompt hero-prompt">
          <span className="prompt-sign">sparktech@studio</span>:<span className="prompt-path">~</span>$ ./sparktech --pitch
        </p>

        {/* "AI is here." demoted to a kicker: it sets up why advice is the
            scarce thing now, but advisory is the headline. */}
        <p className="hero-kicker">AI is here.</p>

        <h1 className="hero-headline">
          Advice that ships.<span className="tw-caret" aria-hidden="true" />
        </h1>

        <p className="hero-thesis reveal">
          We help you decide what is worth building.{' '}
          <span className="serif hero-em hero-thesis-beat">Then we build it.</span>
        </p>

        <p className="hero-sub reveal">
          Anyone can get code written now. The scarce part is judgment: what to
          build, what breaks at ten thousand users, when to say no. You get that
          first, and a team that ships it second.
        </p>

        <div className="hero-buttons reveal">
          <a href="#waitlist" className="hero-btn-primary">[ start_a_project ]</a>
          <a href="#portfolio" className="hero-link">
            see_the_work <span className="hero-arrow">↓</span>
          </a>
        </div>
      </div>
    </section>
  )
}
