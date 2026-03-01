import './Waitlist.css'

export default function Waitlist() {
  return (
    <section className="waitlist" id="waitlist">
      <div className="waitlist-glow" />
      <div className="waitlist-inner reveal">
        <h2>Have an idea? Let's talk.</h2>
        <p>Drop your email and we'll reach out to talk about your project.</p>
        <form
          className="waitlist-form"
          action="https://tally.so/r/kd6VAj"
          method="GET"
          target="_blank"
        >
          <input type="email" name="email" placeholder="you@email.com" required />
          <button type="submit" className="btn btn-primary">Get in touch</button>
        </form>
        <p className="waitlist-note">No spam, no fluff — just a conversation about what you want to build.</p>
      </div>
    </section>
  )
}
