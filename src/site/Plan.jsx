import { useEffect, useRef } from 'react'
import { pricing, WHOP } from './facts.js'
import { Join } from './ui.jsx'

// The website plan as a membership card (the founder's pick, 2026-11-21). The closing "Have Something To Build?" band
// with Book a call sits right below it on the home page. 2026-11-24 (Spencer: "Add it, keep Book a call first"): one
// outlined Whop button under the card, the only way to pay on the site; Book a call stays the main button everywhere.
// 2026-11-21, final pass: "way higher-level design", "more actual 3D, more like an actual membership card", and "when my
// mouse goes around it, I want the card to actually move, not the light or a gradient in the card".
// So: a real object. A black brushed-metal card with gold foil, an EMV chip and the contactless mark, and a gold edge
// with real thickness (stacked layers in 3D). The whole card turns and drifts toward the pointer anywhere in the pricing
// section, its shadow moves on the ground below, and a click (or tap) flips it over to the back. Nothing inside the card
// moves or changes light. Still with reduced motion.

const TURN = 18   // degrees the card turns toward the pointer
const DRIFT = 14  // px the card drifts toward the pointer
const EDGE = 7    // layers of gold edge, 1px apart

const Chip = () => <svg className="mc-chip" viewBox="0 0 50 38" aria-hidden="true">
  <defs><linearGradient id="mc-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff0b8" /><stop offset=".45" stopColor="#ffd15c" /><stop offset="1" stopColor="#b8860b" /></linearGradient></defs>
  <rect x=".5" y=".5" width="49" height="37" rx="6" fill="url(#mc-gold)" stroke="#8a6508" strokeOpacity=".5" />
  <path d="M0 13h15M0 25h15M35 13h15M35 25h15M15 0v38M35 0v38M15 19h20M25 0v8M25 30v8" stroke="#7a5a0a" strokeOpacity=".55" strokeWidth="1" fill="none" />
  <rect x="15" y="8" width="20" height="22" rx="3" fill="none" stroke="#7a5a0a" strokeOpacity=".55" />
</svg>

const Contactless = () => <svg className="mc-nfc" viewBox="0 0 24 24" aria-hidden="true">
  <path d="M8 7.5a6.5 6.5 0 0 1 0 9M11.5 5a10 10 0 0 1 0 14M15 2.5a13.5 13.5 0 0 1 0 19" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
</svg>

export function PlanCard() {
  const stage = useRef(null), card = useRef(null), shadow = useRef(null)
  useEffect(() => {
    const st = stage.current, el = card.current, sh = shadow.current
    if (!st || !el) return
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const zone = st.closest('section') || st
    // target and current values, eased each frame so the card feels like it has weight
    const t = { x: 0, y: 0, flip: 0, lift: 0 }, c = { x: 0, y: 0, flip: 0, lift: 0 }
    let raf = 0, flipped = false, down = null
    const frame = () => {
      raf = 0
      let moving = false
      for (const k in t) { const d = t[k] - c[k]; c[k] += d * (k === 'flip' ? .09 : .12); if (Math.abs(d) > .001) moving = true; else c[k] = t[k] }
      el.style.transform = `translate3d(${(c.x * DRIFT).toFixed(2)}px, ${(c.y * DRIFT - c.lift * 10).toFixed(2)}px, 0) rotateX(${(-c.y * TURN).toFixed(2)}deg) rotateY(${(c.x * TURN + c.flip * 180).toFixed(2)}deg)`
      if (sh) sh.style.transform = `translate3d(${(-c.x * 26).toFixed(2)}px, ${(18 + c.lift * 8 - c.y * 10).toFixed(2)}px, 0) scale(${(1 - c.lift * .06).toFixed(3)})`
      if (sh) sh.style.opacity = (.85 - c.lift * .25).toFixed(3)
      if (moving) raf = requestAnimationFrame(frame)
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame) }
    const aim = e => {
      const r = st.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2
      t.x = Math.max(-1, Math.min(1, (e.clientX - cx) / (r.width * .9)))
      t.y = Math.max(-1, Math.min(1, (e.clientY - cy) / (r.height * 1.2)))
      t.lift = 1
      kick()
    }
    const rest = () => { t.x = 0; t.y = 0; t.lift = 0; kick() }
    const flip = () => { flipped = !flipped; t.flip = flipped ? 1 : 0; kick() }
    const onDown = e => { down = { x: e.clientX, y: e.clientY } }
    const onUp = e => { if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 8) flip(); down = null; if (e.pointerType !== 'mouse') rest() }
    if (still) { st.addEventListener('click', flip); return () => st.removeEventListener('click', flip) }
    zone.addEventListener('pointermove', aim)
    zone.addEventListener('pointerleave', rest)
    st.addEventListener('pointerdown', onDown)
    st.addEventListener('pointerup', onUp)
    st.addEventListener('pointercancel', rest)
    return () => {
      zone.removeEventListener('pointermove', aim); zone.removeEventListener('pointerleave', rest)
      st.removeEventListener('pointerdown', onDown); st.removeEventListener('pointerup', onUp); st.removeEventListener('pointercancel', rest)
      cancelAnimationFrame(raf)
    }
  }, [])
  return <div className="pl pl-a">
    <div className="mc-wrap">
      <div className="mc-stage" ref={stage} aria-hidden="true">
        <div className="mc-shadow" ref={shadow} />
        <div className="mc" ref={card}>
          {Array.from({ length: EDGE }, (_, i) => <i key={i} className="mc-edge" style={{ transform: `translateZ(${(i - (EDGE - 1) / 2).toFixed(1)}px)` }} />)}
          <div className="mc-face mc-front">
            <div className="mc-row"><p className="mc-brand"><img src="/favicon-tab.svg" alt="" width="28" height="28" /><span>SparkTech Studios</span></p><Contactless /></div>
            <Chip />
            <div className="mc-row mc-low"><p className="mc-name">Website Membership</p><p className="mc-cost"><strong>{pricing.site.price}</strong><span>/ month</span></p></div>
          </div>
          <div className="mc-face mc-back">
            <i className="mc-stripe" />
            <div className="mc-sign"><span>Member</span></div>
            <div className="mc-row mc-low"><p className="mc-site">sparktechstudio.com</p><img src="/favicon-tab.svg" alt="" width="26" height="26" /></div>
          </div>
        </div>
      </div>
    </div>
    {WHOP.checkoutReady && <div className="pl-buy"><Join from="price-card" /><p>Month to month through Whop. Cancel anytime.</p></div>}
    <p className="sr">Website membership, {pricing.site.price} a month.</p>
  </div>
}
