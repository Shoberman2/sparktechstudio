import { lazy, Suspense, useEffect } from 'react'
import './DesignLab.css'

// Three directions for the new site, side by side at /designs/1, /designs/2, /designs/3. The live site is untouched.
const Company = lazy(() => import('./Company.jsx'))

const designs = [
  { n: '1', name: 'Liquid', note: 'Dark. A liquid-metal field rendered live in WebGL, gold in the highlights.', C: lazy(() => import('./Liquid.jsx')) },
  { n: '2', name: 'Form', note: 'White. A 3D point cloud that morphs between forms. Each product has its own.', C: lazy(() => import('./Form.jsx')) },
  { n: '3', name: 'Contour', note: 'Stone gray. A topographic map that keeps moving, with the work as its legend.', C: lazy(() => import('./Contour.jsx')) },
]

export default function DesignLab() {
  const parts = window.location.pathname.split('/')
  const n = parts[2]
  const d = designs.find(x => x.n === n)
  useEffect(() => { if (n === 'work') return; document.title = d ? `${d.name} | SparkTech Studio` : 'Designs | SparkTech Studio' }, [d, n])
  if (n === 'work') return <Suspense fallback={null}><Company slug={parts[3]} /></Suspense>
  if (d) return <Suspense fallback={null}><d.C /><nav className="dl-switch" aria-label="Designs">{designs.map(x => <a key={x.n} href={`/designs/${x.n}`} aria-current={x.n === n ? 'page' : undefined}>{x.name}</a>)}</nav></Suspense>
  return <main className="dl">
    <h1>Three directions</h1>
    <ul>{designs.map(x => <li key={x.n}><a href={`/designs/${x.n}`}><strong>{x.name}</strong><span>{x.note}</span></a></li>)}</ul>
  </main>
}
