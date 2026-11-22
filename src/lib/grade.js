// The website grader's scoring, shared by the API (api/grade.js) and the page (src/site/Grader.jsx).
// No JSX, no Node APIs: plain data and one function, so both sides add up the same score.

// Each check and how many of the 100 points it carries. The list is in the order the page shows it.
export const CHECKS = [
  // SEO: found and chosen on Google (70 points). Phone speed is not tested (founder, 2026-11-21: "just leave it out").
  { id: 'mobile', group: 'seo', label: 'Mobile friendly', weight: 10 },
  { id: 'https', group: 'seo', label: 'Secure connection (HTTPS)', weight: 10 },
  { id: 'cta', group: 'seo', label: 'A clear way to contact you', weight: 10 },
  { id: 'alt', group: 'seo', label: 'Image descriptions', weight: 8 },
  { id: 'links', group: 'seo', label: 'Broken links on the homepage', weight: 8 },
  { id: 'title', group: 'seo', label: 'Page title', weight: 7 },
  { id: 'description', group: 'seo', label: 'Search description', weight: 6 },
  { id: 'h1', group: 'seo', label: 'Main heading', weight: 6 },
  { id: 'og', group: 'seo', label: 'Share preview', weight: 5 },
  // AEO: named in answers from ChatGPT, Claude, Perplexity and Google AI (30 points)
  { id: 'ai', group: 'aeo', label: 'Open to AI tools', weight: 8 },
  { id: 'schema', group: 'aeo', label: 'Structured data', weight: 6 },
  { id: 'entity', group: 'aeo', label: 'Who you are, in a form AI can quote', weight: 5 },
  { id: 'text', group: 'aeo', label: 'Readable without JavaScript', weight: 5 },
  { id: 'faq', group: 'aeo', label: 'Answers to customer questions', weight: 4 },
  { id: 'llms', group: 'aeo', label: 'An llms.txt file', weight: 2 },
]

const byId = Object.fromEntries(CHECKS.map(c => [c.id, c]))

// results: [{ id, earned (0 to 1, or null when it could not be measured), title, fix, detail }]
// A check that could not be measured is left out of the total instead of counting as a zero.
export function grade(results) {
  const known = results.filter(r => byId[r.id])
  const measured = known.filter(r => typeof r.earned === 'number')
  const total = measured.reduce((s, r) => s + byId[r.id].weight, 0)
  const got = measured.reduce((s, r) => s + byId[r.id].weight * Math.max(0, Math.min(1, r.earned)), 0)
  const score = total ? Math.round((got / total) * 100) : 0
  // The same sum per group, so the page can show an SEO score and an AEO score beside the overall one
  const part = g => {
    const m = measured.filter(r => byId[r.id].group === g)
    const t = m.reduce((s, r) => s + byId[r.id].weight, 0)
    return t ? Math.round(m.reduce((s, r) => s + byId[r.id].weight * Math.max(0, Math.min(1, r.earned)), 0) / t * 100) : null
  }
  const rows = known.map(r => {
    const weight = byId[r.id].weight
    const lost = typeof r.earned === 'number' ? weight * (1 - Math.max(0, Math.min(1, r.earned))) : 0
    return { ...r, label: byId[r.id].label, group: byId[r.id].group, weight, lost, impact: lost >= 7 ? 'High impact' : lost >= 3.5 ? 'Medium impact' : 'Low impact' }
  })
  return {
    score,
    seo: part('seo'),
    aeo: part('aeo'),
    fixes: rows.filter(r => r.lost >= 0.5).sort((a, b) => b.lost - a.lost),
    passed: rows.filter(r => typeof r.earned === 'number' && r.lost < 0.5),
    skipped: rows.filter(r => typeof r.earned !== 'number'),
  }
}

export function verdict(score) {
  if (score >= 90) return 'Your site is in good shape.'
  if (score >= 70) return 'A solid site with a few things to fix.'
  if (score >= 50) return 'Your site works, but it is losing you visitors.'
  return 'Your site needs real work.'
}
