import './Showcase.css'

const projects = [
  {
    name: 'BallotWatch',
    url: 'https://ballotwatch.io',
    logo: '/logo-ballotwatch.svg',
    desc: 'A civic tech platform that makes local government transparent and accessible. Track legislation, representatives, and voting records all in one place.',
    tags: ['Civic Tech', 'Public Data', 'Full-Stack'],
  },
  {
    name: 'Utern.ai',
    url: 'https://utern.ai',
    logo: '/logo-utern.png',
    desc: 'Swipe for internships. A web and mobile app that turns the internship hunt into something fast, fun, and actually usable.',
    tags: ['Career Tech', 'Mobile + Web', 'Consumer App'],
  },
]

export default function Showcase() {
  return (
    <section className="showcase-section" id="portfolio">
      <div className="showcase-inner">
        <header className="showcase-header reveal">
          <h2>
            Selected <em>work</em>.
          </h2>
          <p>
            Real products, live in production. Someone said "what if..."
            and we built it.
          </p>
        </header>

        <div className="family-tree">
          <div className="tree-root reveal">
            <img src="/logo.svg" alt="" className="tree-root-logo" />
            <span className="tree-root-name">SparkTech Studios</span>
          </div>

          <svg
            className="tree-branches"
            viewBox="0 0 100 56"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M 50 0 V 28 H 25 V 56 M 50 28 H 75 V 56"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <div className="tree-children reveal-stagger">
            {projects.map(p => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="tree-node reveal"
              >
                <div className="tree-logo">
                  <img src={p.logo} alt="" loading="lazy" />
                </div>
                <div className="tree-body">
                  <h3>
                    {p.name}
                    <span className="tree-arrow" aria-hidden="true">↗</span>
                  </h3>
                  <p>{p.desc}</p>
                  <div className="tree-tags">
                    {p.tags.map(t => (
                      <span className="tree-tag" key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
