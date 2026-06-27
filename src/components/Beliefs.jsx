import { useState } from 'react'
import './Beliefs.css'
import Typewriter from './Typewriter'

export default function Beliefs() {
  // Type the body out one block at a time, top to bottom.
  const [phase, setPhase] = useState(0)

  return (
    <section className="beliefs" id="about">
      <div className="beliefs-inner">
        <aside className="beliefs-header reveal">
          <p className="prompt">
            <span className="prompt-sign">spark@studio</span>:<span className="prompt-path">~</span>${' '}
            <Typewriter as="span" text="cat why-we-exist.txt" speed={28} />
          </p>
          <h2><Typewriter as="span" text="// why we exist" speed={36} startDelay={520} /></h2>
        </aside>

        <div className="beliefs-body">
          <blockquote className="beliefs-quote">
            <Typewriter
              as="span"
              className="serif"
              speed={15}
              startDelay={400}
              text="Everyone has that one idea. The one they can't stop thinking about. Too unique for a template, too ambitious for a freelancer."
              onDone={() => setPhase(1)}
            />
          </blockquote>
          <p>
            <Typewriter
              speed={12}
              gate={phase >= 1}
              text={'That is who we are for. We build the things that do not fit neatly into a category, the products that make people ask "wait, how does this exist?" You bring the wild concept; we turn it into software real people can use.'}
              onDone={() => setPhase(2)}
            />
          </p>
          <p>
            <Typewriter
              speed={12}
              gate={phase >= 2}
              text="And we do it fast, not by cutting corners but because building efficiently is what frees us to obsess over the parts that matter: the feel, the details, the craft that makes it yours."
              onDone={() => setPhase(3)}
            />
          </p>
          <p>
            <Typewriter
              speed={12}
              gate={phase >= 3}
              keepCursor
              text="You do not need a massive budget or a year of runway. You need a senior team that gets excited about weird ideas and knows how to ship. That is SparkTech Studios."
            />
          </p>
        </div>
      </div>
    </section>
  )
}
