import './Waitlist.css'

export default function Waitlist() {
  return (
    <section className="waitlist" id="waitlist">
      <div className="waitlist-inner reveal">
        <h2>// got a crazy idea?</h2>
        <p className="waitlist-sub">
          The wilder the concept, the more excited we get. One email, one real
          conversation about what you want to build. No forms, no funnel.
        </p>

        <div className="waitlist-term term">
          <div className="term-bar">
            <span className="term-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="term-title">~/new-project — mail</span>
          </div>
          <div className="term-body">
            <a className="waitlist-cmd" href="mailto:contactus@sparktechstudio.com">
              <span className="prompt-sign">spark@studio</span>:<span className="prompt-path">~</span>$ mail{' '}
              <span className="waitlist-email">contactus@sparktechstudio.com</span>
              <span className="tw-caret" aria-hidden="true" />
            </a>
          </div>
        </div>

        <p className="waitlist-note comment">
          # no spam, no fluff, no "let's circle back." just a reply from a human.
        </p>
      </div>
    </section>
  )
}
