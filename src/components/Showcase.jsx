import './Showcase.css'

const projects = [
  {
    num: '01',
    name: 'BallotWatch',
    url: 'https://ballotwatch.io',
    desc: 'A civic tech platform that makes local government transparent and accessible. Track legislation, representatives, and voting records all in one place.',
    tags: ['Civic Tech', 'Public Data', 'Full-Stack'],
  },
  {
    num: '02',
    name: 'Rate My Divorce Lawyer',
    url: 'https://ratemydivorcelawyer.com',
    desc: 'A review and discovery platform helping people find the right divorce attorney. Real reviews, real experiences, better decisions during a difficult time.',
    tags: ['Legal Tech', 'Reviews', 'Consumer App'],
  },
]

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
)

export default function Showcase() {
  return (
    <section className="showcase-section" id="portfolio">
      <div className="showcase-header reveal">
        <div className="showcase-label">Selected Work</div>
        <h2>Crazy Ideas We've Shipped</h2>
        <p>Real products, live in production. Someone said "what if..." and we built it.</p>
      </div>
      <div className="projects-grid reveal-stagger">
        {projects.map(project => (
          <a
            key={project.name}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card reveal"
          >
            <span className="project-number">{project.num}</span>
            <div className="project-card-top">
              <h3>
                {project.name}
                <ArrowIcon />
              </h3>
              <p>{project.desc}</p>
            </div>
            <ul className="project-tags">
              {project.tags.map(tag => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </a>
        ))}
      </div>
    </section>
  )
}
