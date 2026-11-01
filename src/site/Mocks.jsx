// Concrete pictures of each service, built in HTML and CSS with the site's own tokens (white, ink, one gold).
// Each one shows the work itself, not art. Example text is plain and generic: no invented stats, rankings or clients.

const Check = () => <svg className="mk-check" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="10" /><path d="M5.5 10.2l3 3 6-6.4" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>

// Websites: a real site we built, in a plain browser frame
export function SiteMock() {
  return <figure className="mk mk-browser">
    <div className="mk-bar" aria-hidden="true"><span className="mk-dots"><i /><i /><i /></span><span className="mk-url">utern.ai</span></div>
    <a href="/work/utern" tabIndex={-1}><img src="/work/utern/og.jpg" alt="The UTern website, which we designed and built" width="1200" height="630" loading="lazy" decoding="async" /></a>
  </figure>
}

// AI agents: an inbox where the agent answers a question and logs the lead
export function AgentMock() {
  return <figure className="mk mk-inbox" aria-label="An AI agent answering a customer email and logging the lead">
    <div className="mk-head"><strong>Inbox</strong><span>SparkTech Studio</span></div>
    <div className="mk-mail">
      <p className="mk-from"><strong>Dana Ruiz</strong><span>9:14 pm</span></p>
      <p className="mk-subj">Do you build sites for restaurants?</p>
      <p>We need a new site with our menu and online reservations. What would that cost?</p>
    </div>
    <div className="mk-mail mk-reply">
      <p className="mk-from"><strong>Agent reply</strong><span>9:15 pm</span></p>
      <p>Yes, we do. A new website is $12k to $25k and usually takes 3 to 5 weeks. Want to book a call to talk it through?</p>
    </div>
    <p className="mk-done"><Check />Lead logged: Dana Ruiz, restaurant website, wants a call</p>
  </figure>
}

// Website updates: a short change request marked done, beside the text before and after
export function UpdateMock() {
  return <figure className="mk mk-update" aria-label="A website change request, done">
    <div className="mk-req">
      <p className="mk-from"><strong>Change request</strong><span>Mon</span></p>
      <p className="mk-subj">Update our holiday hours</p>
      <p>Closed on Thanksgiving, please. Same hours every other day.</p>
      <p className="mk-done"><Check />Done and live the same day</p>
    </div>
    <div className="mk-diff">
      <p className="mk-label">Before</p>
      <p className="mk-old">Open every day, 9am to 6pm.</p>
      <p className="mk-label">After</p>
      <p className="mk-new">Open 9am to 6pm. Closed on Thanksgiving.</p>
    </div>
  </figure>
}

// SEO and AEO: one search result and one AI answer, both pointing at the same business site
export function SearchMock() {
  return <figure className="mk mk-search" aria-label="A Google result and an AI answer, both citing the business site">
    <div className="mk-g">
      <p className="mk-query">family dentist in Park Slope</p>
      <p className="mk-site">yourpractice.com</p>
      <p className="mk-title">Family Dentist in Park Slope, Brooklyn</p>
      <p>Cleanings, fillings and kids’ visits. Most insurance taken. Book online.</p>
    </div>
    <div className="mk-ai">
      <p className="mk-label">AI answer</p>
      <p>A family practice in Park Slope sees kids and adults, takes most insurance, and lets you book online.</p>
      <p className="mk-cite">Source: <strong>yourpractice.com</strong></p>
    </div>
  </figure>
}

