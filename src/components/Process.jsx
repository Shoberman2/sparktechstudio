import './Process.css'

const steps = [
  {
    n: '1',
    name: 'scope',
    desc: 'You tell us the idea. We tell you what is actually hard about it, what it costs, and what we would cut. Straight answer in one conversation, not a deck two weeks later.',
  },
  {
    n: '2',
    name: 'build',
    desc: 'AI does the volume. A senior engineer owns the architecture and reads every line that ships. You are looking at something running in days, not staring at wireframes for a month.',
  },
  {
    n: '3',
    name: 'harden',
    desc: 'The unglamorous half: auth, data, payments, cost, the failure modes that never show up in a demo. This is the part that decides whether it survives real users.',
  },
  {
    n: '4',
    name: 'ship',
    desc: 'It goes live on infrastructure that holds, with monitoring so you know before your users do. You own the code, the accounts, and the keys. No lock-in, no retainer trap.',
  },
]

export default function Process() {
  return (
    <section className="process" id="process">
      <div className="process-inner">
        <header className="process-header reveal">
          <p className="prompt">
            <span className="prompt-sign">sparktech@studio</span>:<span className="prompt-path">~</span>$ cat how-we-work.txt
          </p>
          <h2>// how we work</h2>
          <p className="process-lead">
            Four steps, no ceremony. The same way whether it is a weekend
            prototype or the thing your company runs on.
          </p>
        </header>

        <ol className="process-list reveal-stagger">
          {steps.map((s) => (
            <li className="process-step reveal" key={s.n}>
              <div className="process-step-top">
                <span className="process-n">[{s.n}/4]</span>
                <span className="process-name">{s.name}<span className="process-paren">()</span></span>
              </div>
              <p className="process-desc">{s.desc}</p>
            </li>
          ))}
        </ol>

        <p className="process-footnote reveal">
          <span className="comment"># no timelines on this page. we quote yours after step 1, not before.</span>
        </p>
      </div>
    </section>
  )
}
