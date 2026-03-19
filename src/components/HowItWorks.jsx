import './HowItWorks.css'

const steps = [
  { num: 1, title: 'You tell us the idea', desc: 'The weirder the better. You explain what you\'re imagining, we figure out how to make it real. No judgment, no "that\'s not possible."' },
  { num: 2, title: 'We build it, fast', desc: 'We get to work immediately. Not wireframes and decks. Actual code, actual product. You\'ll see something working before you expect to.' },
  { num: 3, title: 'We make it right', desc: 'Once it\'s live, we refine it together. Tweak the feel, dial in the details, make it something you\'re proud to show off.' },
  { num: 4, title: 'It\'s yours', desc: 'Your product launches with solid infrastructure, ready to grow. And when people ask how you built it so fast, you can just smile.' },
]

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="approach">
      <div className="how-inner">
        <div className="how-header reveal">
          <h2>Our Process</h2>
          <p>From wild idea to live product. Here's how it works.</p>
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
