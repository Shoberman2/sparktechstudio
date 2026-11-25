import { useEffect, useRef, useState } from 'react'
import { track } from '@vercel/analytics'
import { grade, verdict } from '../lib/grade.js'
import { Book } from './ui.jsx'
import { FIX_KIT } from './facts.js'

// The free SEO and AEO checker: one field, a live workflow, a score out of 100 and a ranked fix list.
// The work happens in api/grade.js, in one call that reads the homepage and runs every check (phone speed is not
// tested, founder 2026-11-21). The workflow is honest: "Read the homepage" ticks when that call returns, then
// the search, AI and links stages light up one after another with their real results (how many checks passed),
// the score counts up last. Nothing ticks before its work is done.
// The full report is on the page: every fix with its details (which images, which links, what the title says), then
// everything that passed with what we found. No email, nothing stored (founder, 2026-11-21).

// The workflow, left to right. `ids` are the checks (src/lib/grade.js) each stage reports on.
const STAGES = [
  { k: 'read', label: 'Read your homepage' },
  { k: 'seo', label: 'Search basics', ids: ['https', 'mobile', 'title', 'description', 'h1', 'alt', 'og'] },
  { k: 'aeo', label: 'AI answers', ids: ['ai', 'schema', 'entity', 'text', 'faq', 'llms'] },
  { k: 'links', label: 'Links and contact', ids: ['links', 'cta'] },
  { k: 'score', label: 'Your score' },
]
const REVEAL = 420 // ms between the page stages lighting up once their results are in

const Check = () => <svg className="mk-check" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="10" /><path d="M5.5 10.2l3 3 6-6.4" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
const still = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = ms => new Promise(r => setTimeout(r, still() ? 0 : ms))

async function ask(url, part) {
  const r = await fetch(`/api/grade?part=${part}&url=${encodeURIComponent(url)}`)
  const data = await r.json().catch(() => ({}))
  if (!r.ok || !data.ok) throw new Error(data.error || 'The checker is not available right now. Try again in a minute.')
  return data
}

// "5 of 7 pass" for a stage, from the real check results
function tally(ids, checks) {
  const mine = checks.filter(c => ids.includes(c.id) && typeof c.earned === 'number')
  if (!mine.length) return 'Not measured'
  const ok = mine.filter(c => c.earned >= 0.95).length
  return ids.length === 1 ? (ok ? 'Passed' : 'Needs work') : `${ok} of ${mine.length} pass`
}

// The workflow: a gold rail that fills as stages finish. Horizontal on wide screens, vertical on phones.
function Flow({ stages, host }) {
  const done = stages.filter(s => s.state === 'done' || s.state === 'skip').length
  const now = stages.find(s => s.state === 'active')
  return <div className="gf" style={{ '--p': Math.min(1, done / (stages.length - 1)) }}>
    <p className="gf-site">Checking <strong>{host}</strong></p>
    <ol className="gf-rail" style={{ '--n': stages.length }}>
      {stages.map(s => <li key={s.k} className={`gf-node is-${s.state}`}>
        <span className="gf-dot" aria-hidden="true">{s.state === 'done' ? <svg viewBox="0 0 20 20"><path d="M5.5 10.2l3 3 6-6.4" /></svg> : null}</span>
        <span className="gf-label">{s.label}</span>
        <span className="gf-note">{s.note || (s.state === 'active' ? 'Working' : '')}</span>
      </li>)}
    </ol>
    <p className="sr" role="status" aria-live="polite">{now ? `${now.label}…` : ''}</p>
  </div>
}

// The score: a gold ring that fills and a number that counts up to the real score
function Score({ score }) {
  const [n, setN] = useState(still() ? score : 0)
  useEffect(() => {
    if (still()) return
    let raf, t0
    const step = t => { t0 ??= t; const p = Math.min(1, (t - t0) / 1200); setN(Math.round(score * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(step) }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [score])
  const C = 2 * Math.PI * 54
  return <div className="gs-ring" role="img" aria-label={`${score} out of 100`}>
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="54" className="gs-track" />
      <circle cx="60" cy="60" r="54" className="gs-fill" style={{ strokeDasharray: C, strokeDashoffset: C * (1 - n / 100) }} />
    </svg>
    <p className="gs-num" aria-hidden="true"><span>{n}</span>out of 100</p>
  </div>
}

const fresh = () => STAGES.map((s, i) => ({ ...s, state: i === 0 ? 'active' : 'wait', note: '' }))

export default function Grader({ where = 'page' }) {
  const [url, setUrl] = useState('')
  const [state, setState] = useState('idle') // idle | running | done | error
  const [stages, setStages] = useState(fresh)
  const [host, setHost] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const out = useRef(null)
  const set = (k, state, note = '') => setStages(all => all.map(s => s.k === k ? { ...s, state, note } : s))

  async function run(e) {
    e.preventDefault()
    const site = url.trim()
    if (!site || state === 'running') return
    setHost(site.replace(/^https?:\/\//, '').replace(/\/.*$/, ''))
    setStages(fresh()); setState('running'); setError(''); setResult(null)
    track('grader_run', { where })
    try {
      const page = await ask(site, 'page')
      setHost(page.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))
      set('read', 'done', 'Read')
      for (const k of ['seo', 'aeo', 'links']) {
        set(k, 'active'); await wait(REVEAL)
        set(k, 'done', tally(STAGES.find(s => s.k === k).ids, page.checks))
      }
      set('score', 'active'); await wait(REVEAL)
      const graded = grade(page.checks)
      set('score', 'done', `${graded.score} of 100`)
      setResult({ ...graded, url: page.url })
      setState('done')
      track('grader_done', { where, score: graded.score })
      requestAnimationFrame(() => out.current?.focus())
    } catch (err) {
      setError(err.message)
      setState('error')
    }
  }

  const shown = result ? result.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : ''

  return <div className="gr">
    <form className="gr-form" onSubmit={run}>
      <label className="sr" htmlFor={`gr-url-${where}`}>Your website address</label>
      <input id={`gr-url-${where}`} name="url" inputMode="url" autoCapitalize="none" autoCorrect="off" spellCheck="false" autoComplete="url" placeholder="yourbusiness.com" required maxLength={300} value={url} onChange={e => setUrl(e.target.value)} />
      <button className="btn" type="submit" disabled={state === 'running'}>{state === 'running' ? 'Checking' : 'Check my website'}</button>
    </form>

    {(state === 'running' || state === 'done') && <Flow stages={stages} host={host} />}
    {state === 'running' && <p className="gr-hint">This takes a few seconds.</p>}

    {state === 'error' && <p className="gr-error" role="alert">{error}</p>}

    {state === 'done' && result && <div className="gr-out" ref={out} tabIndex={-1} aria-label={`Results for ${shown}`}>
      <div className="gr-score">
        <Score score={result.score} />
        <div className="gr-score-text">
          <p className="gr-verdict">{verdict(result.score)}</p>
          <p className="gr-host">{shown}</p>
          <div className="gr-parts">
            {[['SEO', 'Google search', result.seo], ['AEO', 'AI answers', result.aeo]].map(([k, sub, v]) => <div key={k} className="gr-part">
              <p><strong>{k}</strong><span>{sub}</span><b className="num">{v ?? '–'}</b></p>
              <div className="gr-meter" aria-hidden="true"><i style={{ '--v': (v ?? 0) / 100 }} /></div>
            </div>)}
          </div>
        </div>
      </div>

      {result.fixes.length > 0 ? <>
        <h3 className="gr-h">What To Fix First</h3>
        <ul className="gr-fixes">{result.fixes.map((f, i) => <li key={f.id} style={{ '--i': i }}>
          <p className={`gr-impact is-${f.impact.split(' ')[0].toLowerCase()}`}>{f.impact}<span>{f.group === 'aeo' ? 'AEO' : 'SEO'}</span></p>
          <h4>{f.title}</h4>
          <p>{f.fix}</p>
          {f.detail && <p className="gr-detail">{f.detail}</p>}
        </li>)}</ul>
      </> : <p className="gr-clean">Nothing to fix. Every check passed.</p>}

      {result.passed.length > 0 && <>
        <h3 className="gr-h">What Is Working</h3>
        <ul className="gr-pass">{result.passed.map((p, i) => <li key={p.id} style={{ '--i': i }}><Check /><span>{p.title}{p.detail && <small className="gr-detail">{p.detail}</small>}</span></li>)}</ul>
      </>}
      {result.skipped.map(s => <p key={s.id} className="gr-skip">{s.title}, so it is left out of the score.</p>)}

      {/* 2026-11-25: the $97 Get Found Fix sits beside Book a call, second, and only when there is something to fix.
          fix_kit_click sends where it was and the score band, so we can see which scores buy (briefs/get-found-fix.md). */}
      <div className="gr-cta">
        <h3>Want Us To Fix These?</h3>
        {result.fixes.length > 0 && <p>Or get the fixes ready to paste, with a short video, in 3 business days for {FIX_KIT.price}. It counts toward your first month if you join within 30 days.</p>}
        <div className="actions">
          <Book from={`grader-${where}`} />
          {result.fixes.length > 0 && <a className="btn ghost" href={FIX_KIT.checkout} target="_blank" rel="noopener" onClick={() => track('fix_kit_click', { from: `grader-${where}`, score: result.score >= 80 ? '80+' : result.score >= 50 ? '50-79' : 'under-50' })}>Get the fixes for {FIX_KIT.price}</a>}
        </div>
      </div>

    </div>}
  </div>
}
