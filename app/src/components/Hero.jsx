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
            <span className="word" style={{ animationDelay: '0.2s' }}>design</span>
          </span>
          <span className="word-line">
            <span className="word" style={{ animationDelay: '0.3s' }}>experiences</span>{' '}
            <span className="word" style={{ animationDelay: '0.4s' }}>that</span>
          </span>
          <span className="word-line">
            <span className="word" style={{ animationDelay: '0.5s' }}>feel</span>{' '}
            <span className="word word-alive" style={{ animationDelay: '0.6s' }}><em>alive</em></span>
          </span>
        </h1>
        <p className="hero-sub">
          SparkTech Studios is where code meets craft. We build full-stack platforms
          with AI-powered tools — shipping real products in weeks, not months.
        </p>
        <div className="hero-buttons">
          <a href="#waitlist" className="btn btn-primary">Start a project</a>
          <a href="#portfolio" className="btn btn-outline">See the work</a>
        </div>
      </div>
    </section>
  )
}
