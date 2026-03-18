import './Features.css'

const features = [
  {
    num: '01',
    icon: (
      <svg viewBox="0 0 48 48" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l11 11" />
        <path d="M28 6l11 11-11 11" />
      </svg>
    ),
    title: 'Code as Medium',
    desc: 'We treat code the way a painter treats oil. It\'s our medium, not just a tool. Every line serves the experience.',
  },
  {
    num: '02',
    icon: (
      <svg viewBox="0 0 48 48" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="16" />
        <polyline points="24 14 24 24 32 28" />
      </svg>
    ),
    title: 'Speed as Art',
    desc: 'Full platforms in weeks, not months. We move at a pace that would have been impossible a year ago, and we ship things that last.',
  },
  {
    num: '03',
    icon: (
      <svg viewBox="0 0 48 48" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="36 18 24 6 12 18" />
        <line x1="24" y1="6" x2="24" y2="34" />
        <path d="M12 42h24" />
      </svg>
    ),
    title: 'End-to-End Craft',
    desc: 'We don\'t just design surfaces. We build complete systems: databases, APIs, auth, dashboards. Real software for real users, from concept to deploy.',
  },
]

export default function Features() {
  return (
    <section className="features" id="capabilities">
      <div className="features-inner">
        <div className="features-grid reveal-stagger">
          {features.map((f, i) => (
            <div className="feature-card reveal" key={i}>
              <div className="feature-num">{f.num}</div>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
