import './Process.css'

const steps = [
  {
    n: '1',
    name: 'scope',
    desc: 'You tell us the idea. We tell you what is actually hard about it, and what it costs.',
  },
  {
    n: '2',
    name: 'build',
    desc: 'AI writes the volume. A senior engineer owns the architecture and reads every line.',
  },
  {
    n: '3',
    name: 'harden',
    desc: 'Auth, data, payments, cost. The failure modes that never show up in a demo.',
  },
  {
    n: '4',
    name: 'ship',
    desc: 'Live on infrastructure that holds. You own the code, the accounts, the keys.',
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
            Advice first, then execution. The same four steps whether it is a
            weekend prototype or the thing your company runs on.
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
