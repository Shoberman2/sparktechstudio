import './Thesis.css'

export default function Thesis() {
  return (
    <section className="thesis" id="thesis">
      <div className="thesis-inner">
        <header className="thesis-header reveal">
          <p className="prompt">
            <span className="prompt-sign">sparktech@studio</span>:<span className="prompt-path">~</span>$ cat thesis.txt
          </p>
          <h2>// the thesis</h2>
        </header>

        <div className="thesis-body">
          <blockquote className="thesis-quote reveal">
            <span className="serif">
              Building got cheap. Deciding what to build did not.
            </span>
          </blockquote>

          <p className="reveal">
            AI closed the gap between an idea and something that runs. It did not
            close what comes after: real users, messy data, the bill.
          </p>

          <p className="reveal">
            Marc Andreessen calls the engineers who adapted{' '}
            <span className="thesis-term">AI vampires</span> — twenty agents at
            once, twenty times the output. He named the catch in the same breath:
            productivity is outrunning comprehension. More is being shipped than
            anyone is deciding on.
          </p>

          <p className="reveal">
            So the job is judgment first. What is worth building, what breaks at
            scale, what to cut, when to stop. We give you that answer, then we go
            build it and run it. Advisors who ship, not consultants who hand you
            a deck.
          </p>

          <p className="thesis-footnote reveal">
            <span className="comment"># web, mobile, and ai products. zero to production, then past it.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
