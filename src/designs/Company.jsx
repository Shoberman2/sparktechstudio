import { companies, studies, workSlugs } from './content.jsx'
import { Shell, Section } from './Layout.jsx'
import { Rows } from './Page.jsx'

// One page per product at /work/<slug>: what it is, the case study, what is live and what is coming, how it works.
const SP_DOTS = [[46.5, 10.9], [46.4, 24.4], [46.5, 37.9], [73.5, 37.9], [19.4, 38], [32.9, 38], [60, 38], [32.9, 51.5], [46.4, 51.5], [5.8, 51.6], [19.3, 51.6], [46.5, 65.1], [32.6, 65.2], [32.8, 78.6]]
const SpacialMark = () => <svg viewBox="-4 0 102 92" role="img" aria-label="Spacial Health mark">{SP_DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5.2" fill="#c9bdff" />)}</svg>

export default function Company({ slug }) {
  const c = companies.find(x => x.slug === slug)
  const st = studies[c.slug]
  const frame = c.bg ? { backgroundImage: `url(${c.bg})` } : { background: c.bgCss || 'var(--surface)' }
  return <Shell title={`${c.name} | SparkTech Studio`}>
    <section className="head wrap">
      <h1>{c.name}</h1>
      <p className="lede">{c.value}</p>
      <div className="actions">
        {c.url ? <a className="btn btn-primary" href={c.url} target="_blank" rel="noreferrer">Visit {c.host}</a> : <span className="note">{c.host}</span>}
        <a className="btn btn-line" href="/work">All work</a>
      </div>
    </section>

    <div className="wrap">
      <div className={`frame frame-${c.slug}`} style={frame}>
        {c.figure === 'spacial-mark' ? <SpacialMark /> : <img src={c.figure} alt={c.figureAlt} />}
      </div>
    </div>

    <Section className="split" title="What it is"><p className="text">{c.lede}</p></Section>

    {st && <Section title="The case study">
      <ul className="rows">
        <li><h3>The problem</h3><p>{st.problem}</p></li>
        <li><h3>What we built</h3><ul className="plain">{st.built.map(b => <li key={b}>{b}</li>)}</ul></li>
        <li><h3>Built with</h3><p>{st.stack}</p></li>
        <li><h3>Where it stands</h3><p>{st.status}</p></li>
        {st.results && <li><h3>Results</h3><p>{st.results}</p></li>}
      </ul>
    </Section>}

    {c.today && <Section title={c.visionTitle}>
      <div className="cols">
        <div><h3>{c.todayLabel || 'Live today'}</h3><ul className="plain">{c.today.map(t => <li key={t}>{t}</li>)}</ul></div>
        {c.vision?.length > 0 && <div><h3>Where it’s going</h3><ul className="plain muted">{c.vision.map(t => <li key={t}>{t}</li>)}</ul></div>}
      </div>
      {c.note && <p className="note">{c.note}</p>}
    </Section>}

    {c.how && <Section title={c.howTitle}>
      <Rows items={c.how} />
      {c.howNote && <p className="note">{c.howNote}</p>}
    </Section>}

    <Section title="More work">
      <ul className="list">{workSlugs.filter(s => s !== slug).map(s => companies.find(x => x.slug === s)).map(x => <li key={x.slug}><a href={`/work/${x.slug}`}><strong>{x.name}</strong><span>{x.line}</span></a></li>)}</ul>
    </Section>
  </Shell>
}
