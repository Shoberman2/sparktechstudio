import './Waitlist.css'

export default function Waitlist() {
  return (
    <section className="waitlist" id="waitlist">
      <div className="waitlist-inner">
        <h2>Be the first to know</h2>
        <p>We're building in public. Drop your email and we'll let you know when we launch something worth your attention.</p>
        <form
          className="waitlist-form"
          action="https://tally.so/r/kd6VAj"
          method="GET"
          target="_blank"
        >
          <input type="email" name="email" placeholder="you@email.com" required />
          <button type="submit" className="btn btn-primary">Join the waitlist</button>
        </form>
        <p className="waitlist-note">No spam. Just launch updates.</p>
      </div>
    </section>
  )
}
