import './Showcase.css'

const projects = [
  {
    name: 'ballotwatch.io',
    url: 'https://ballotwatch.io',
    logo: '/logo-ballotwatch.svg',
    desc: 'A civic-tech platform that makes local government legible. Track legislation, representatives, and voting records in one place.',
    does: 'Turns scattered public records into something a normal person can actually follow.',
    tags: ['civic-tech', 'public-data', 'full-stack'],
    built: 'React · Node · Postgres',
  },
  {
    name: 'utern.ai',
    url: 'https://utern.ai',
    logo: '/logo-utern.png',
    desc: 'Swipe for internships. The internship hunt turned into something fast, fun, and genuinely usable on web and mobile.',
    does: 'Matches students to roles with a swipe, then gets out of the way.',
    tags: ['career-tech', 'mobile+web', 'consumer'],
    built: 'React Native · Web · AI matching',
  },
]

export default function Showcase() {
  return (
    <section className="showcase-section" id="portfolio">
      <div className="showcase-inner">
        <header className="showcase-header reveal">
          <p className="prompt">
            <span className="prompt-sign">spark@studio</span>:<span className="prompt-path">~</span>$ ls ~/work --tree
          </p>
          <h2>// selected work</h2>
          <p className="showcase-lead">
            Real products, live, with real users. These are not mockups or
            concept pages, click any of them and you land on the thing we
            shipped.
          </p>
        </header>

        <div className="tree">
          <div className="tree-root reveal">
            <img src="/logo.svg" alt="" className="tree-root-logo" />
            <span className="tree-root-name">sparktech-studios/</span>
          </div>

          <ul className="tree-list reveal-stagger">
            {projects.map((p, i) => {
              const last = i === projects.length - 1
              return (
                <li className="tree-row reveal" key={p.name}>
                  <span className="tree-glyph" aria-hidden="true">{last ? '└──' : '├──'}</span>
                  <a
                    className="tree-node"
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="tree-node-bar">
                      <span className="tree-fav">
                        <img src={p.logo} alt="" loading="lazy" />
                      </span>
                      <span className="tree-node-name">{p.name}</span>
                      <span className="tree-status">[live]</span>
                      <span className="tree-arrow" aria-hidden="true">↗</span>
                    </div>
                    <div className="tree-node-body">
                      <p className="tree-desc">{p.desc}</p>
                      <p className="tree-line"><span className="tree-k">does</span>{p.does}</p>
                      <p className="tree-line"><span className="tree-k">built</span>{p.built}</p>
                      <div className="tree-tags">
                        {p.tags.map((t) => (
                          <span className="tree-tag" key={t}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>

          <p className="tree-footnote reveal">
            <span className="comment"># every project here is in production. yours is next.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
