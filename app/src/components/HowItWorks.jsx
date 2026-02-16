import './HowItWorks.css'

const steps = [
  { num: 1, title: 'Ideate', desc: 'We source and evaluate high-leverage software ideas, looking for real problems with big markets.' },
  { num: 2, title: 'Prototype', desc: 'Build a working prototype fast. Get it in front of real users and gather signal on product-market fit.' },
  { num: 3, title: 'Validate', desc: "Run lean experiments. Measure engagement, retention, and willingness to pay. Kill what doesn't work." },
  { num: 4, title: 'Scale', desc: 'Double down on winners. Build the team, infrastructure, and go-to-market strategy to grow fast.' },
]

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="approach">
      <div className="how-inner">
        <div className="how-header">
          <h2>How SparkTech Studios works</h2>
          <p>A repeatable process for turning ideas into real, scalable products.</p>
        </div>
        <div className="steps-grid">
          {steps.map(s => (
            <div className="step" key={s.num}>
              <div className="step-number">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
