import { useEffect, useId } from 'react'
import './LogoIntro.css'

export default function LogoIntro({ onFinish }) {
  const id = useId()
  useEffect(() => {
    const timer = window.setTimeout(onFinish, 3800)
    const keys = event => { if (event.key === 'Escape') onFinish() }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const preference = () => { if (motion.matches) onFinish() }
    window.addEventListener('keydown', keys)
    motion.addEventListener('change', preference)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', keys)
      motion.removeEventListener('change', preference)
    }
  }, [onFinish])

  return <button className="logo-intro" type="button" aria-label="Skip logo introduction" onClick={onFinish}>
    <div className="intro-orbit intro-orbit-one" aria-hidden="true" />
    <div className="intro-orbit intro-orbit-two" aria-hidden="true" />
    <svg className="intro-spark" viewBox="0 0 48 48" aria-hidden="true">
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d3ad48" /><stop offset="1" stopColor="#7a5a0a" /></linearGradient></defs>
      <g fill={`url(#${id})`}>
        <path className="intro-ray" style={{ '--dx':'0px', '--dy':'-65px', '--r':'-100deg' }} d="M24 4 L26.5 18 L28 14 L24 4z" />
        <path className="intro-ray" style={{ '--dx':'0px', '--dy':'65px', '--r':'100deg' }} d="M24 44 L21.5 30 L20 34 L24 44z" />
        <path className="intro-ray" style={{ '--dx':'-65px', '--dy':'0px', '--r':'-100deg' }} d="M4 24 L18 21.5 L14 20 L4 24z" />
        <path className="intro-ray" style={{ '--dx':'65px', '--dy':'0px', '--r':'100deg' }} d="M44 24 L30 26.5 L34 28 L44 24z" />
        <path className="intro-core" d="M24 18 L30 24 L24 30 L18 24z" />
        {[[14,14,1.5],[34,14,1],[34,34,1.5],[14,34,1]].map(([cx,cy,r],i) => <circle className="intro-dot" key={i} cx={cx} cy={cy} r={r} style={{ '--dx':`${(cx-24)*6}px`, '--dy':`${(cy-24)*6}px` }} />)}
      </g>
    </svg>
  </button>
}
