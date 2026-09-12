import { useEffect, useId, useRef } from 'react'
import './AnimatedLogo.css'

const rays = [
  ['M24 4 L26.5 18 L28 14 L24 4z', 0, -9],
  ['M24 44 L21.5 30 L20 34 L24 44z', 0, 9],
  ['M4 24 L18 21.5 L14 20 L4 24z', -9, 0],
  ['M44 24 L30 26.5 L34 28 L44 24z', 9, 0],
]
const dots = [[14, 14, 1.5, .6], [34, 14, 1, .4], [34, 34, 1.5, .5], [14, 34, 1, .3]]

export default function AnimatedLogo() {
  const gradient = useId()
  const logoRef = useRef(null)

  useEffect(() => {
    const logo = logoRef.current
    const stage = logo.closest('.hero-playground')
    const hero = logo.closest('.hero')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let lastTime = 0
    let x = 0
    let velocity = 0
    let lift = 0
    let liftVelocity = 0
    let target = 0
    let dragging = false
    let travel = 120

    const paint = () => {
      const tilt = x / travel * 5
      logo.style.setProperty('--x', `${x}px`)
      logo.style.setProperty('--y', `${lift + x * Math.tan(tilt * Math.PI / 180)}px`)
      logo.style.setProperty('--roll', `${x / 1.25}deg`)
      stage.style.setProperty('--balance', `${tilt}deg`)
    }
    const tick = (time) => {
      frame = 0
      if (motion.matches) return
      const dt = Math.min((time - (lastTime || time - 16.67)) / 16.67, 2)
      lastTime = time
      velocity += (target - x) * .055 * dt
      velocity *= Math.pow(.78, dt)
      x += velocity * dt
      liftVelocity += -lift * .09 * dt
      liftVelocity *= Math.pow(.8, dt)
      lift += liftVelocity * dt
      paint()
      if (Math.abs(target - x) > .05 || Math.abs(velocity) > .05 || Math.abs(lift) > .05 || Math.abs(liftVelocity) > .05) {
        frame = requestAnimationFrame(tick)
      } else { lastTime = 0 }
    }
    const wake = () => {
      if (!frame && !motion.matches) frame = requestAnimationFrame(tick)
    }
    const scroll = () => {
      if (motion.matches || dragging) return
      travel = Math.min(stage.clientWidth * .3, 220)
      const top = hero.getBoundingClientRect().top + scrollY
      const progress = Math.max(0, Math.min(1, (scrollY - top + 120) / 350))
      target = (progress * 2 - 1) * travel * .8
      wake()
    }
    const move = (event) => {
      if (event.pointerType !== 'mouse' && !dragging) return
      const rect = stage.getBoundingClientRect()
      target = Math.max(-travel, Math.min(travel, event.clientX - rect.left - rect.width / 2))
      wake()
    }
    const down = (event) => {
      if (motion.matches) return
      dragging = true
      logo.setPointerCapture(event.pointerId)
      liftVelocity = -8
      move(event)
    }
    const release = () => { dragging = false }
    const nudge = () => { liftVelocity = -12; target = -target || travel * .6; wake() }
    const key = (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
      event.preventDefault()
      target = Math.max(-travel, Math.min(travel, target + (event.key === 'ArrowRight' ? 60 : -60)))
      wake()
    }
    const preference = () => {
      cancelAnimationFrame(frame)
      frame = 0
      if (motion.matches) { x = velocity = lift = liftVelocity = target = 0; paint() }
      else scroll()
    }
    stage.addEventListener('pointermove', move)
    logo.addEventListener('pointerdown', down)
    logo.addEventListener('pointerup', release)
    logo.addEventListener('pointercancel', release)
    logo.addEventListener('lostpointercapture', release)
    logo.addEventListener('click', nudge)
    logo.addEventListener('keydown', key)
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', scroll)
    motion.addEventListener('change', preference)
    scroll()
    return () => {
      cancelAnimationFrame(frame)
      stage.removeEventListener('pointermove', move)
      logo.removeEventListener('pointerdown', down)
      logo.removeEventListener('pointerup', release)
      logo.removeEventListener('pointercancel', release)
      logo.removeEventListener('lostpointercapture', release)
      logo.removeEventListener('click', nudge)
      logo.removeEventListener('keydown', key)
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('resize', scroll)
      motion.removeEventListener('change', preference)
    }
  }, [])

  return <button className="animated-logo" ref={logoRef} type="button" aria-label="Play with the spark. Click to bounce, or use left and right arrow keys to balance it.">
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs><linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#b8860b" /><stop offset="100%" stopColor="#7a5a0a" /></linearGradient></defs>
      <g className="spark-assembly" fill={`url(#${gradient})`}>
        {rays.map(([d, x, y]) => <path className="spark-ray" key={d} d={d} style={{ '--x': `${x}px`, '--y': `${y}px` }} />)}
        <path className="spark-core" d="M24 18 L30 24 L24 30 L18 24z" />
        {dots.map(([cx, cy, r, opacity], i) => <circle className="spark-dot" key={i} cx={cx} cy={cy} r={r} opacity={opacity} style={{ '--dx': `${(cx - 24) * .65}px`, '--dy': `${(cy - 24) * .65}px` }} />)}
      </g>
    </svg>
  </button>
}
