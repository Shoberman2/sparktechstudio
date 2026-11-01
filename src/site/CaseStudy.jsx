import { companies, studies, workSlugs } from '../designs/content.jsx'
import { SITE } from './facts.js'
import { Shell, Sec, Shot, List, Links, JsonLd } from './ui.jsx'

// /work/<slug>: one product, told plainly. The real screen up top, then the problem, what we built, and what it runs on.
export default function CaseStudy({ slug }) {
  const c = companies.find(x => x.slug === slug), st = studies[slug]
  const others = workSlugs.filter(s => s !== slug).map(s => companies.find(x => x.slug === s))
  return <Shell title={`${c.name} | SparkTech Studio`} active="work" bandTitle="Want Something Built Like This?">
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ['Work', '/work'], [c.name, `/work/${slug}`]].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })) }} />
    <section className="phead"><div className="wrap">
      <h1>{c.name}</h1>
      <p>{c.value}</p>
      {c.url && <div className="actions"><a className="btn ghost" href={c.url} target="_blank" rel="noreferrer">Visit {c.host}</a></div>}
      <Shot slug={slug} name={c.name} />
    </div></section>
    {st ? <>
      <Sec title="The Problem"><p className="read reveal" style={{ fontSize: 21, color: 'var(--ink)' }}>{st.problem}</p></Sec>
      <Sec title="What We Built"><ul className="built">{st.built.map(b => <li key={b} className="reveal">{b}</li>)}</ul></Sec>
      <Sec title="What It Runs On">
        <dl className="facts reveal"><div><dt>Stack</dt><dd>{st.stack}</dd></div><div><dt>Status</dt><dd>{st.status}</dd></div></dl>
      </Sec>
    </> : <>
      <Sec title="What It Does" line={c.lede}><List items={c.how} /></Sec>
      {c.howNote && <Sec><p className="note reveal">{c.howNote}</p></Sec>}
    </>}
    {workSlugs.includes(slug) && <Sec title="More Work"><Links items={others.map(o => [o.name, `/work/${o.slug}`])} /></Sec>}
  </Shell>
}
