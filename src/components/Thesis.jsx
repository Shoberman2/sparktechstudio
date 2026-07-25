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
              Anyone can build an app now. Almost nobody can scale one.
            </span>
          </blockquote>

          <p className="reveal">
            AI closed the distance between an idea and something that runs. That
            part is over. What nobody automated is everything after: the product
            holding up when real users arrive, when the data gets messy, when
            the bill shows up.
          </p>

          <p className="reveal">
            Marc Andreessen calls the engineers who adapted{' '}
            <span className="thesis-term">AI vampires</span>. They run twenty
            coding agents at once, sleep less than they should, and ship roughly
            twenty times what they did a year ago. He named the catch in the
            same breath: productivity is outrunning comprehension. There is more
            code being written than there are people who understand it.
          </p>

          <p className="reveal">
            That gap is the job. AI gives you speed. It does not tell you what to
            build, what breaks at ten thousand users, or which of the four
            thousand lines it just wrote you should keep. So we run both on
            purpose: AI for the volume, senior engineers for the calls that
            decide whether the thing lives. Neither half gets there alone.
          </p>

          <p className="thesis-footnote reveal">
            <span className="comment"># web, mobile, and ai products. zero to production, then past it.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
