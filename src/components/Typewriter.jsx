import { useEffect, useRef, useState } from 'react'

/*
 * Typewriter — types text out character by character once it scrolls into
 * view, with a blinking block caret. Makes the page read like it is being
 * generated live in a terminal.
 *
 * Props:
 *   text       string | Array<{ t: string, className?: string }>
 *   as         tag to render (default 'span')
 *   speed      base ms per character (default 26)
 *   startDelay ms to wait after typing is triggered before the first char
 *   cursor     show caret while typing (default true)
 *   keepCursor keep the blinking caret after typing finishes (default false)
 *   gate       when false, hold off typing even if in view (for sequencing).
 *              Typing begins once gate is true AND the element is in view.
 *   className  class for the wrapper element
 *   onDone     called once when typing completes
 */
export default function Typewriter({
  text,
  as: Tag = 'span',
  speed = 26,
  startDelay = 0,
  cursor = true,
  keepCursor = false,
  gate = true,
  className = '',
  onDone,
}) {
  const segments = Array.isArray(text) ? text : [{ t: String(text) }]
  const full = segments.map((s) => s.t).join('')

  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const [inView, setInView] = useState(false)
  const ref = useRef(null)
  const started = useRef(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  // Reduced motion: render everything immediately, no typing.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      started.current = true
      setCount(full.length)
      setDone(true)
      onDoneRef.current?.()
    }
  }, [full])

  // Mark in-view once.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true)
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.25 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Type once in view and the gate is open.
  useEffect(() => {
    if (!inView || !gate || started.current) return
    started.current = true
    const timers = []
    let i = 0
    const tick = () => {
      i += 1
      setCount(i)
      if (i < full.length) {
        const ch = full[i - 1]
        let d
        if (/[.,;:!?]/.test(ch)) d = speed * 7
        else if (ch === ' ') d = speed * 0.7
        else d = speed * (0.55 + Math.random() * 0.95)
        timers.push(setTimeout(tick, d))
      } else {
        setDone(true)
        onDoneRef.current?.()
      }
    }
    timers.push(setTimeout(tick, startDelay))
    return () => timers.forEach(clearTimeout)
  }, [inView, gate, full, speed, startDelay])

  // Build the visible (typed-so-far) output, preserving per-segment styling.
  const rendered = []
  let remaining = count
  for (let s = 0; s < segments.length; s += 1) {
    if (remaining <= 0) break
    const seg = segments[s]
    const slice = seg.t.slice(0, remaining)
    rendered.push(
      seg.className
        ? <span key={s} className={seg.className}>{slice}</span>
        : slice
    )
    remaining -= seg.t.length
  }

  const showCaret = cursor && (!done || keepCursor)

  return (
    <Tag ref={ref} className={className} aria-label={full}>
      <span aria-hidden="true">{rendered}</span>
      {showCaret && <span className="tw-caret" aria-hidden="true" />}
    </Tag>
  )
}
