import './Beliefs.css'

export default function Beliefs() {
  return (
    <section className="beliefs" id="about">
      <div className="beliefs-inner">
        <aside className="beliefs-header reveal">
          <p className="prompt">
            <span className="prompt-sign">sparktech@studio</span>:<span className="prompt-path">~</span>$ cat why-we-exist.txt
          </p>
          <h2>// why we exist</h2>
        </aside>

        <div className="beliefs-body reveal">
          <blockquote className="beliefs-quote">
            <span className="serif">
              Everyone has that one idea. The one they can&apos;t stop thinking
              about. Too unique for a template, too ambitious for a freelancer.
            </span>
          </blockquote>
          <p>
            That is who we are for. You bring the concept; we turn it into
            software real people can use.
          </p>
          <p>
            You do not need a massive budget or a year of runway. You need a
            senior team that gets excited about weird ideas and knows how to
            ship. That is SparkTech Studio.
          </p>
        </div>
      </div>
    </section>
  )
}
