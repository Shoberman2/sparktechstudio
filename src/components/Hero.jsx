import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <h1 className="hero-headline">
          <span className="word-line">
            <span className="word" style={{ animationDelay: '0.05s' }}>We</span>{' '}
            <span className="word" style={{ animationDelay: '0.15s' }}>build</span>{' '}
            <span className="word" style={{ animationDelay: '0.25s' }}>the</span>
          </span>
          <span className="word-line">
            <span className="word hero-mark" style={{ animationDelay: '0.35s' }}>
              <em>crazy</em>
              <svg className="hero-mark-underline" viewBox="0 0 240 18" preserveAspectRatio="none" aria-hidden="true">
                <path d="M 4 11 Q 60 3, 120 9 T 236 7" />
              </svg>
            </span>{' '}
            <span className="word" style={{ animationDelay: '0.45s' }}>ideas.</span>
          </span>
        </h1>

        <p className="hero-sub">
          A studio for the wild ones. Bring us the idea everyone says is
          too ambitious, too weird, too out there. We'll make it real, and
          we'll make it fast.
        </p>

        <div className="hero-buttons">
          <a href="#waitlist" className="hero-btn-primary">
            Start a project
            <span className="hero-arrow" aria-hidden="true">→</span>
          </a>
          <a href="#portfolio" className="hero-link">
            See the work
            <span className="hero-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
