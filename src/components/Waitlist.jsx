import './Waitlist.css'

export default function Waitlist() {
  return (
    <section className="waitlist" id="waitlist">
      <div className="waitlist-inner reveal">
        <header className="waitlist-header">
          <p className="prompt">
            <span className="prompt-sign">sparktech@studio</span>:<span className="prompt-path">~</span>$ mkdir ~/your-idea
          </p>
          <h2>// got a crazy idea?</h2>
        </header>
        <p className="waitlist-sub">
          Still an idea, or already built and buckling under real users. Either
          way it is one email and one real conversation with the people who
          would do the work. No forms, no funnel.
        </p>

        <div className="waitlist-term term">
          <div className="term-bar">
            <span className="term-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="term-title">~/new-project — mail</span>
          </div>
          <div className="term-body">
            <a className="waitlist-cmd" href="mailto:contactus@sparktechstudio.com">
              <span className="prompt-sign">sparktech@studio</span>:<span className="prompt-path">~</span>$ mail{' '}
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
