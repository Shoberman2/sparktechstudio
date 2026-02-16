import './Showcase.css'

const CheckIcon = () => (
  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
)

const tags = ['Civic Tech', 'Creator Tools', 'SMB Software', 'AI-Native Apps']

export default function Showcase() {
  return (
    <section className="showcase-section" id="portfolio">
      <div className="showcase-inner">
        <div className="showcase-text">
          <div className="showcase-label">What We Build</div>
          <h2>Software that solves real problems</h2>
          <p>
            We focus on high-leverage ideas across industries where software can create outsized impact — civic tech, creator tools, small business infrastructure, and more.
          </p>
          <ul className="feature-list">
            {tags.map(tag => (
              <li key={tag}>
                <CheckIcon />
                {tag}
              </li>
            ))}
          </ul>
          <a href="#waitlist" className="btn btn-primary">Get in touch</a>
        </div>
        <div className="showcase-visual">
          <div className="visual-placeholder">
            <div className="vp-header" />
            <div className="vp-row"><div className="vp-block dark w50" /><div className="vp-block w30" /></div>
            <div className="vp-row"><div className="vp-block w70" /></div>
            <div className="vp-row"><div className="vp-block w40" /><div className="vp-block dark w30" /></div>
            <div className="vp-row"><div className="vp-block w60" /></div>
            <div className="vp-grid">
              {[1, 2, 3, 4].map(i => <div key={i} className="vp-grid-item" />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
