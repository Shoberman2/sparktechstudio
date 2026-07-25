import './Showcase.css'
import { projects } from '../data/projects'

const statusLabel = { live: '[live]', building: '[building]', soon: '[soon]' }

export default function Showcase() {
  return (
    <section className="showcase-section" id="portfolio">
      <div className="showcase-inner">
        <header className="showcase-header reveal">
          <p className="prompt">
            <span className="prompt-sign">sparktech@studio</span>:<span className="prompt-path">~</span>$ ls ~/work --tree
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
                <li className="tree-row reveal" key={p.key}>
                  <span className="tree-glyph" aria-hidden="true">{last ? '└──' : '├──'}</span>
                  <a
                    className="tree-node"
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="tree-node-bar">
                      <span className="tree-fav">
                        <img src={p.logo || '/logo.svg'} alt="" loading="lazy" />
                      </span>
                      <span className="tree-node-name">{p.name}</span>
                      <span className={`tree-status tree-status--${p.status}`}>{statusLabel[p.status]}</span>
                      <span className="tree-arrow" aria-hidden="true">↗</span>
                    </div>
                    <div className="tree-node-body">
                      <p className="tree-desc">{p.desc}</p>
                      <p className="tree-line"><span className="tree-k">does</span>{p.does}</p>
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
