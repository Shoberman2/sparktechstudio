import './Navbar.css'

export default function Navbar() {
  return (
    <nav>
      <div className="nav-inner">
        <div className="nav-left">
          <a href="#" className="logo">
            <img src="/logo.png" alt="SparkTech Studios" className="logo-icon" />
            <span className="logo-text gradient-text">SparkTech Studios</span>
          </a>
          <ul className="nav-links">
            <li><a href="#capabilities">Studio</a></li>
            <li><a href="#portfolio">Work</a></li>
            <li><a href="#approach">Approach</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#careers">Careers</a></li>
          </ul>
        </div>
        <div className="nav-right">
          <a href="#waitlist" className="btn btn-primary btn-nav">Start a project</a>
        </div>
      </div>
    </nav>
  )
}
