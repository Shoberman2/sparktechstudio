import './Features.css'

const features = [
  {
    icon: (
      <svg viewBox="0 0 48 48" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l11 11" />
        <path d="M28 6l11 11-11 11" />
      </svg>
    ),
    title: 'Rapid Prototyping',
    desc: 'From concept to working prototype in weeks, not months. We move fast to test assumptions and find product-market fit early.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="16" />
        <polyline points="24 14 24 24 32 28" />
      </svg>
    ),
    title: 'Validation-First',
    desc: "Every idea goes through a rigorous validation process. We build with real users from day one to ensure we're solving problems that matter.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="36 18 24 6 12 18" />
        <line x1="24" y1="6" x2="24" y2="34" />
        <path d="M12 42h24" />
      </svg>
    ),
    title: 'Scale What Works',
    desc: 'When a venture proves real value, we double down. Dedicated resources, proper infrastructure, and the team to take it to market.',
  },
]

export default function Features() {
  return (
    <section className="features" id="ventures">
      <div className="features-inner">
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
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
