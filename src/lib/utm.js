// Outreach attribution. Reads utm_* from the landing URL, keeps them for the session, and hands them to the
// booking link and the contact form. See "UTM naming" in README.md for the values each outreach lane uses.
const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']
const STORE = 'st_utm'

const read = () => {
  try { return JSON.parse(sessionStorage.getItem(STORE)) || {} } catch { return {} }
}

// Call on every page load. A new landing URL with utm params replaces what was stored; otherwise the session keeps the first set.
export function captureUtm() {
  if (typeof window === 'undefined') return {}
  const found = {}
  const q = new URLSearchParams(window.location.search)
  for (const k of KEYS) { const v = (q.get(k) || '').trim().slice(0, 100); if (v) found[k] = v }
  if (Object.keys(found).length) { try { sessionStorage.setItem(STORE, JSON.stringify(found)) } catch { /* storage blocked: attribution is best-effort */ } return found }
  return read()
}

export const getUtm = () => (typeof window === 'undefined' ? {} : read())

// Adds the stored utm params to an http(s) URL. mailto: and anything else pass through unchanged.
export function withUtm(href, utm = getUtm()) {
  if (!/^https?:\/\//i.test(href)) return href
  const url = new URL(href)
  for (const [k, v] of Object.entries(utm)) if (KEYS.includes(k) && v && !url.searchParams.has(k)) url.searchParams.set(k, v)
  return url.toString()
}

// Booking links carry data-book (see BOOK in designs/content.jsx). The href is rewritten when it is used, not at render,
// so the prerendered HTML and the hydrated tree stay identical and every Book a call picks the params up, menus included.
export function initUtm() {
  captureUtm()
  const rewrite = e => {
    const a = e.target instanceof Element ? e.target.closest('a[data-book]') : null
    if (a) a.href = withUtm(a.getAttribute('href'))
  }
  document.addEventListener('click', rewrite, true)
  document.addEventListener('auxclick', rewrite, true)
}
