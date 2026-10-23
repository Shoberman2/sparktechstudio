import { built } from './content.jsx'
import './Form.css'

// The five work tiles, each company on its own ground. Shared by the home page and /services.
const SP_DOTS = [[46.5, 10.9], [46.4, 24.4], [46.5, 37.9], [73.5, 37.9], [19.4, 38], [32.9, 38], [60, 38], [32.9, 51.5], [46.4, 51.5], [5.8, 51.6], [19.3, 51.6], [46.5, 65.1], [32.6, 65.2], [32.8, 78.6]]
const tiles = {
  utern: { bg: '#101a2a url(/work/utern/mountain.webp) center 35% / cover no-repeat', img: '/work/utern/birdee.webp', cls: 'is-utern' },
  leed: { bg: '#0b0b09', img: '/work/leed/sherlock.svg', cls: 'is-leed' },
  ballotwatch: { bg: '#0c1626', img: '/work/ballotwatch/capitol-logo.svg', cls: 'is-bw' },
  spacial: { bg: '#7255ff', cls: 'is-spacial' },
  budtender: { bg: 'radial-gradient(90% 80% at 40% 40%,#3f8a5e,#143b27 70%,#0b2418)', img: '/work/budtender/budzy-phone.webp', cls: 'is-bud' },
}
const Arrow = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13L13 3M5 3h8v8" stroke="currentColor" strokeWidth="1.6" /></svg>

export default function WorkTiles() {
  return <div className="fm-tiles">
    {built.map(b => {
      const t = tiles[b.slug]
      return <a key={b.slug} href={b.url} className={`fm-tile ${t.cls}`} style={{ background: t.bg }}>
        {t.img ? <img src={t.img} alt="" loading="lazy" decoding="async" /> : <svg viewBox="-4 0 102 92" aria-hidden="true" className="fm-tile-dots">{SP_DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5.2" />)}</svg>}
        <span className="fm-tile-go"><Arrow /></span>
        <span className="fm-tile-text"><strong>{b.name}</strong><span>{b.line}</span></span>
      </a>
    })}
  </div>
}
