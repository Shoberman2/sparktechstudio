import './Services.css'
const items = [
  ['Websites', 'Thoughtful design and development for your next website.'],
  ['Digital products', 'From a rough idea to a working app, built with AI and our judgment.'],
  ['Ongoing development', 'New features, improvements, and support after launch.'],
]
export default function Services() {
  return <section className="about" id="about" aria-labelledby="about-title"><div className="wrap about-grid">
    <div><p className="section-label">What we do</p><h2 id="about-title">From first idea<br />to launch.</h2><p className="about-note">One studio for the design, the build, and what comes next.</p></div>
    <dl className="about-list" id="process">{items.map(([title,copy]) => <div key={title}><dt>{title}</dt><dd>{copy}</dd></div>)}</dl>
  </div></section>
}
