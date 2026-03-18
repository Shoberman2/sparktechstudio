import './HowItWorks.css'

const steps = [
  { num: 1, title: 'We talk', desc: 'You bring the vision. The idea, the problem, the insight. We listen, ask the right questions, and map the fastest path to something real.' },
  { num: 2, title: 'We build', desc: 'We build your platform at a pace that would\'ve been impossible a year ago. Real code, real architecture, real fast.' },
  { num: 3, title: 'We refine', desc: 'We get it live quickly, then iterate together based on what users actually do. No six-month roadmaps. Just continuous craft.' },
  { num: 4, title: 'It launches', desc: 'Your product goes live with solid infrastructure, ready to grow. We stick around to help scale when traction hits.' },
]

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="approach">
      <div className="how-inner">
        <div className="how-header reveal">
          <h2>Our Process</h2>
          <p>From conversation to launch. Here's how it works.</p>
        </div>
        <div className="timeline">
          <div className="timeline-line" />
          {steps.map(s => (
            <div className={`timeline-step ${s.num % 2 === 0 ? 'right' : 'left'} reveal`} key={s.num}>
              <div className="step-circle">{s.num}</div>
              <div className="step-content">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
