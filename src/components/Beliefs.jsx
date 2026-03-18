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
            Software development just had its biggest shift in decades, and we're not waiting for the industry to catch up.
          </blockquote>
          <p className="reveal">
            The code can be written fast now. Really fast. And that changes what matters. When the engineering isn't the bottleneck anymore, you get to spend your time where it actually counts: the concept, the feel, the details that make someone stop scrolling.
          </p>
          <p className="reveal">
            That's what excites us. We're not just shipping faster. We're using that speed to obsess over the things that used to get cut for time. The art of it. The craft. The difference between something that works and something that stays with you.
          </p>
          <p className="reveal">
            You shouldn't need a $2M seed round to get a real platform off the ground. You just need a team that treats every pixel like it matters. That's SparkTech Studios.
          </p>
        </div>
      </div>
    </section>
  )
}
