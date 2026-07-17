import './Navbar.css'

export default function Navbar() {
  return (
    <nav>
      <div className="nav-inner">
        <div className="nav-left">
          <span className="term-dots" aria-hidden="true"><i /><i /><i /></span>
          <a href="#" className="logo">
            <img src="/logo.svg" alt="SparkTech Studios" className="logo-icon" />
            <span className="logo-text">sparktech<span className="logo-text-suffix">-studios</span><span className="logo-caret" aria-hidden="true" /></span>
          </a>
        </div>
        <ul className="nav-links">
          <li><a href="#services">./services</a></li>
          <li><a href="#portfolio">./work</a></li>
          <li><a href="#about">./about</a></li>
        </ul>
        <div className="nav-right">
          <a href="#waitlist" className="nav-cta">[ start_a_project ]</a>
        </div>
      </div>
    </nav>
  )
}
