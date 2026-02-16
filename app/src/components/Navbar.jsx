import './Navbar.css'

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

export default function Navbar() {
  return (
    <nav>
      <div className="nav-inner">
        <div className="nav-left">
          <a href="#" className="logo">
            <div className="logo-mark"><BoltIcon /></div>
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
