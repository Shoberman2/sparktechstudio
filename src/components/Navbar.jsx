import './Navbar.css'

export default function Navbar() {
  return (
    <nav>
      <div className="nav-inner">
        <div className="nav-left">
          <a href="#" className="logo">
            <img src="/logo.svg" alt="SparkTech Studios" className="logo-icon" />
            <span className="logo-text">SparkTech Studios</span>
          </a>
          <ul className="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#capabilities">Studio</a></li>
            <li><a href="#portfolio">Work</a></li>
            <li><a href="#approach">Approach</a></li>
          </ul>
        </div>
        <div className="nav-right">
          <a href="#waitlist" className="nav-cta">
            Start a project
            <span className="nav-cta-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </nav>
  )
}
