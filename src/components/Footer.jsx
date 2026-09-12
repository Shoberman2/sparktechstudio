import { projects } from '../data/projects'
import './Footer.css'
export default function Footer() {
  return <footer className="footer"><div className="wrap">
    <div className="footer-top"><a className="footer-brand" href="#top">SparkTech Studio</a><nav aria-label="Our products">{projects.map(p => <a key={p.key} href={p.url} target="_blank" rel="noreferrer">{p.name}</a>)}</nav><a href="#top">Back to top ↑</a></div>
    <div className="footer-meta"><span>© {new Date().getFullYear()} SparkTech Studios, LLC</span><span>From thought to thing.</span></div>
  </div></footer>
}
