import { useEffect, useRef, useSyncExternalStore } from 'react'

// The page ground (2026-11-25, Spencer's pick): a landscape in fine gold lines that the camera flies through as the page
// scrolls, mountains at the top of every page and open sea at the bottom (./grounds/valley.js, its own lazy chunk).
// The canvas exists only in the browser: nothing on the server or during hydration, then it mounts straight away. The page
// paints first on plain near-black; the canvas fades in once its first frame is drawn (site.css, "The ground"). If it
// cannot start, the page simply stays on near-black. With reduced motion it draws one still frame and never moves.
const subscribe = () => () => {}

export default function Ground() {
  const client = useSyncExternalStore(subscribe, () => true, () => false)
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const root = canvas.closest('.st')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let stop = null, dead = false
    const ready = () => { if (!dead) root?.classList.add('ground-on') }
    import('./grounds/valley.js')
      .then(m => { if (!dead) stop = m.default(canvas, { reduced, ready }) })
      .catch(err => console.warn('The ground did not start:', err))
    return () => {
      dead = true
      try { stop?.() } catch { /* already gone */ }
      root?.classList.remove('ground-on')
    }
  }, [client])
  return client ? <canvas ref={ref} className="ground" aria-hidden="true" /> : null
}
