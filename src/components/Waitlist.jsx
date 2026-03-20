import './Waitlist.css'

export default function Waitlist() {
  return (
    <section className="waitlist" id="waitlist">
      <div className="waitlist-glow" />
      <div className="waitlist-inner reveal">
        <h2>Got A Crazy Idea? Tell Us.</h2>
        <p>The wilder the concept, the more excited we get. Send us an email and let's talk.</p>
        <a href="mailto:contactus@sparktechstudio.com" className="btn btn-primary btn-email">contactus@sparktechstudio.com</a>
        <p className="waitlist-note">No spam, no fluff. Just a conversation about what you want to build.</p>
      </div>
    </section>
  )
}
