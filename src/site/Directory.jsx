import { useState } from 'react'
import { projects, CATEGORIES } from '../data/projects.js'

// "Work" on the home page: one card per product or client project, read from src/data/projects.js.
// The first project in the file is shown large. The whole card is the link. Category and status are plain words.
// The filter stays out of the way until the list is long enough to need one.
const FILTER_FROM = 7

export default function Directory() {
  const [cat, setCat] = useState('All')
  const cats = CATEGORIES.filter(c => projects.some(p => p.category === c))
  const shown = cat === 'All' ? projects : projects.filter(p => p.category === cat)
  return <div className="dir">
    {projects.length >= FILTER_FROM && cats.length > 1 && <div className="dir-filter" role="group" aria-label="Filter by type">
      {['All', ...cats].map(c => <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>{c === 'All' ? 'All' : `${c}s`}</button>)}
    </div>}
    <ul className="dir-grid">
      {shown.map(p => <li key={p.name} className="reveal">
        <a className="card" href={p.page || p.url} {...(p.page ? {} : { target: '_blank', rel: 'noreferrer' })}>
          <div className="card-shot">{p.image && <img src={p.image} alt={`${p.name}, as it looks today`} width="800" height="420" loading="lazy" decoding="async" />}</div>
          <div className="card-text">
            <div className="card-top"><h3>{p.name}</h3><span className="card-meta">{p.category} · {p.status}</span></div>
            <span className="card-line">{p.line}</span>
            {p.stat && <span className="card-stat">{p.stat}</span>}
          </div>
        </a>
      </li>)}
    </ul>
  </div>
}
