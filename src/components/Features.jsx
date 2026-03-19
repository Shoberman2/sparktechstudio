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
    title: 'No Idea Too Wild',
    desc: 'That thing you\'ve been sketching on napkins? The concept everyone told you was impossible? That\'s exactly what we want to build.',
  },
  {
    num: '02',
    icon: (
      <svg viewBox="0 0 48 48" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="16" />
        <polyline points="24 14 24 24 32 28" />
      </svg>
    ),
    title: 'Absurdly Fast',
    desc: 'Full platforms in weeks, not months. We don\'t do six-month timelines. You bring the vision, we bring the speed.',
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
    title: 'The Whole Thing',
    desc: 'We don\'t hand you a mockup and wish you luck. We build the entire product: front end, back end, database, deployment. Done.',
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
