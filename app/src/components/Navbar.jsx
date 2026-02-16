import './Navbar.css'

export default function Navbar() {
  return (
    <nav>
      <div className="nav-inner">
        <div className="nav-left">
          <a href="#" className="logo">
            <span className="logo-text">SparkTech Studios</span>
          </a>
          <ul className="nav-links">
            <li><a href="#ventures">Ventures</a></li>
            <li><a href="#approach">Approach</a></li>
            <li><a href="#portfolio">What We Build</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </div>
        <div className="nav-right">
          <a href="#waitlist" className="link-login">Contact</a>
          <a href="#waitlist" className="btn btn-primary">Work with us</a>
          <a href="#about" className="btn btn-outline">Learn more</a>
        </div>
      </div>
    </nav>
  )
}
