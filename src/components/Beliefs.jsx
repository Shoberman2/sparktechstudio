import './Beliefs.css'

export default function Beliefs() {
  return (
    <section className="beliefs" id="about">
      <div className="beliefs-inner">
        <aside className="beliefs-header reveal">
          <h2>
            Why we <em>exist</em>.
          </h2>
        </aside>

        <div className="beliefs-body">
          <blockquote className="beliefs-quote reveal">
            Everyone has that one idea. The one they can't stop thinking
            about. The one that's too unique for a template and too
            ambitious for a freelancer.
          </blockquote>
          <p className="reveal">
            That's who we're for. We build the things that don't fit neatly
            into a category. The products that make people say "wait, how
            does this exist?" We take your wildest concept and turn it
            into something real, something you can actually show people.
          </p>
          <p className="reveal">
            And we do it fast. Not by cutting corners, but because building
            efficiently is what lets us spend time on the stuff that
            matters: making your idea feel exactly the way you imagined
            it. The details. The craft. The thing that makes it yours.
          </p>
          <p className="reveal">
            You don't need a massive budget or a year of runway. You just
            need a team that gets excited about weird ideas and knows how
            to ship. That's SparkTech Studios.
          </p>
        </div>
      </div>
    </section>
  )
}
