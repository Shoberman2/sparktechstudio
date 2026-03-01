import './Beliefs.css'

export default function Beliefs() {
  return (
    <section className="beliefs" id="about">
      <div className="beliefs-inner">
        <div className="beliefs-header reveal">
          <h2>Why we build this way</h2>
        </div>
        <div className="beliefs-text">
          <blockquote className="beliefs-quote reveal">
            Software development just had its biggest shift in decades — and we're not waiting for the industry to catch up.
          </blockquote>
          <p className="reveal">
            AI tools like Claude and Cursor have made it possible for us to build what used to take entire engineering teams and months of runway. We're building with these tools right now, every day, pushing them to their limits.
          </p>
          <p className="reveal">
            This isn't a gimmick. It's a fundamentally different way to create software — faster iteration, lower cost, and the ability to ship complete platforms in weeks instead of quarters. That's the advantage we bring to every project.
          </p>
          <p className="reveal">
            You shouldn't need a $2M seed round to get a real platform off the ground. With AI-powered craft and the right eye for design, you just need a team that gives a damn. That's SparkTech Studios.
          </p>
        </div>
      </div>
    </section>
  )
}
