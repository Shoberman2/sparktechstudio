import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-inner">
        <div className="hero-badge">
          <span>Creative studio, <strong>2026</strong></span>
        </div>
        <h1>
          <span className="word-line">
            <span className="word" style={{ animationDelay: '0.1s' }}>We</span>{' '}
            <span className="word" style={{ animationDelay: '0.2s' }}>build</span>{' '}
            <span className="word" style={{ animationDelay: '0.3s' }}>your</span>
          </span>
          <span className="word-line">
            <span className="word word-alive" style={{ animationDelay: '0.4s' }}><em>crazy</em></span>{' '}
            <span className="word" style={{ animationDelay: '0.5s' }}>idea</span>
          </span>
        </h1>
        <p className="hero-sub">
          You've got that idea everyone says is too ambitious, too weird, too out there.
          Good. Bring it to us. We'll make it real, and we'll make it fast.
        </p>
        <div className="hero-buttons">
          <a href="#waitlist" className="btn btn-primary">Start a project</a>
          <a href="#portfolio" className="btn btn-outline">See the work</a>
        </div>
      </div>
    </section>
  )
}
