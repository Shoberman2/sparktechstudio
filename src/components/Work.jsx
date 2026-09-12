import { projects } from '../data/projects'
import { ArrowOut } from './Icons'
import './Work.css'
export default function Work() {
  return <section className="work" id="work" aria-labelledby="work-title"><div className="wrap">
    <div className="work-head"><h2 id="work-title">Selected work</h2><p>Ideas out in the world.</p></div>
    <ul className="work-list">{projects.map(project => <li key={project.key}>
      <a href={project.url} target="_blank" rel="noreferrer" aria-label={`${project.name}, opens in a new tab`}>
        <h3>{project.name}</h3><p>{project.desc}</p><span className="work-status"><span className="live-dot" aria-hidden="true" />Live</span><ArrowOut />
      </a></li>)}</ul>
  </div></section>
}
