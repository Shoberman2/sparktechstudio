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
            That is who we are for. We build the things that do not fit neatly
            into a category, the products that make people ask &quot;wait, how
            does this exist?&quot; You bring the wild concept; we turn it into
            software real people can use.
          </p>
          <p>
            And we do it fast, not by cutting corners but because building
            efficiently is what frees us to obsess over the parts that matter:
            the feel, the details, the craft that makes it yours.
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
