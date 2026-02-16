import './Hero.css'

const StarIcon = () => (
  <svg viewBox="0 0 20 20">
    <path d="M10 1l2.39 4.84L18 6.71l-4 3.9.94 5.5L10 13.47l-4.94 2.64.94-5.5-4-3.9 5.61-.87z" />
  </svg>
)

function MockBrowser() {
  return (
    <div className="hero-image">
      <div className="mock-browser">
        <div className="mock-toolbar">
          <div className="mock-dot red" />
          <div className="mock-dot yellow" />
          <div className="mock-dot green" />
          <div className="mock-url">sparktechstudios.com</div>
        </div>
        <div className="mock-body">
          <div className="mock-sidebar">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`mock-sidebar-item${i === 1 ? ' active' : ''}`} />
            ))}
          </div>
          <div className="mock-main">
            <div className="mock-header-bar" />
            <div className="mock-cards">
              {[1, 2, 3].map(i => (
                <div key={i} className="mock-card">
                  <div className="mock-card-value" />
                  <div className="mock-card-label" />
                </div>
              ))}
            </div>
            <div className="mock-chart">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="mock-bar" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-badge">
            Something new is coming &nbsp;<strong>2026</strong>
          </div>
          <h1>We turn ideas into real software, fast</h1>
          <p className="hero-sub">
            SparkTech Studios builds software products from scratch. We move quick, stay lean, and use every tool at our disposal — including AI — to go from idea to product in record time.
          </p>
          <div className="hero-buttons">
            <a href="#waitlist" className="btn btn-primary">Get started</a>
            <a href="#approach" className="btn btn-outline">See our approach</a>
          </div>
          <div className="hero-social-proof">
            <div className="stars">
              {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} />)}
            </div>
            <span>Ventures launching soon</span>
          </div>
        </div>
        <MockBrowser />
      </div>
    </section>
  )
}
