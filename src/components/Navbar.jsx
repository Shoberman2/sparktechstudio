import { ArrowOut } from './Icons'
import './Navbar.css'
export default function Navbar() {
  return <header className="nav" id="top"><div className="wrap nav-row">
    <a className="nav-brand" href="#top"><img src="/logo.svg" alt="" width="26" height="26" /><span>SparkTech<span className="brand-studio">Studio</span></span></a>
    <nav className="nav-links" aria-label="Main navigation"><a href="#work">Work</a><a href="#about">Services</a></nav>
    <a className="nav-cta" href="#contact">Contact <ArrowOut /></a>
  </div></header>
}
