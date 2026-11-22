// Booked calls, measured (2026-11-22, founder: "measure the funnel first"). Every Book a call already sends `book_call`
// (a click). This opens Calendly over the page instead of in a new tab, so a finished booking can be counted too:
// Calendly posts `calendly.event_scheduled` to this window and we send `call_booked` with where the click came from
// and the visitor's utm_source. Vercel Pro keeps two properties per custom event; these are the two.
//
// The link stays a plain link: no JavaScript, a blocked script or a cmd/ctrl/middle click all open Calendly in a new
// tab exactly as before. Calendly's widget loads once the page is idle or a visitor heads for a booking link, never
// before the page has drawn.
import { track } from '@vercel/analytics'
import { getUtm } from './utm.js'

const JS = 'https://assets.calendly.com/assets/external/widget.js'
const CSS = 'https://assets.calendly.com/assets/external/widget.css'
let loading = null
let lastFrom = 'page'

function load() {
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    const css = document.createElement('link')
    css.rel = 'stylesheet'; css.href = CSS
    document.head.appendChild(css)
    const js = document.createElement('script')
    js.src = JS; js.async = true
    js.onload = () => (window.Calendly ? resolve(window.Calendly) : reject(new Error('no Calendly')))
    js.onerror = reject
    document.head.appendChild(js)
  })
  loading.catch(() => {}) // a blocked script just means links keep opening in a new tab
  return loading
}

const bookLink = e => (e.target instanceof Element ? e.target.closest('a[data-book]') : null)

export function initBooking() {
  if (typeof window === 'undefined') return
  // Bubble phase, so initUtm (capture phase) has already put the visitor's utm_* params on the href
  document.addEventListener('click', e => {
    const a = bookLink(e)
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    lastFrom = a.dataset.from || 'page'
    // Only take over when the widget is ready; otherwise the link opens Calendly in a new tab as it always has
    if (!window.Calendly?.initPopupWidget) { load(); return }
    e.preventDefault()
    window.Calendly.initPopupWidget({ url: a.href })
  })
  // Fetch the widget when someone is about to book, and anyway once the page is idle
  const intent = e => { if (bookLink(e)) load() }
  document.addEventListener('pointerover', intent, { passive: true })
  document.addEventListener('touchstart', intent, { passive: true })
  document.addEventListener('focusin', intent)
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 2500))
  const later = () => idle(() => load(), { timeout: 5000 })
  if (document.readyState === 'complete') later()
  else window.addEventListener('load', later, { once: true })
  // The booking itself
  window.addEventListener('message', e => {
    if (e.origin !== 'https://calendly.com' || e.data?.event !== 'calendly.event_scheduled') return
    track('call_booked', { from: lastFrom, source: getUtm().utm_source || 'direct' })
  })
}
