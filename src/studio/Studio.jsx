import { useEffect, useState } from 'react'
import { projects } from '../data/projects'
import './Studio.css'

const systems = [
  { id: 'quality', title: 'A second set of eyes. Every release.', name: 'Quality & release', tag: 'Browser + computer use', intro: 'Agents explore the product as a user would. Every finding needs a reproduction, every fix needs a retest.', steps: ['Explore real journeys', 'Reproduce the failure', 'Send evidence to a build agent', 'Retest the fix', 'Verify the release'], detail: 'Screenshots, steps, and expected behavior travel with the bug. An implementation agent proposes a fix; the QA workflow checks the original failure and nearby journeys. Release permissions stay explicit.', output: 'Reproducible issues, reviewable fixes, release evidence.' },
  { id: 'maintenance', title: 'Keep the everyday from becoming urgent.', name: 'Daily maintenance', tag: 'Scheduled care', intro: 'A daily pass over product health, broken journeys, dependencies, and recurring failures.', steps: ['Check health', 'Rank findings', 'Propose repairs', 'Run checks', 'Report exceptions'], detail: 'Routine checks should run on a schedule. Changes follow the company’s review rules, with an owner for exceptions and a record of what changed.', output: 'A prioritized maintenance queue and verified repairs.' },
  { id: 'analytics', title: 'Better outcomes. Beyond more clicks.', name: 'Product learning', tag: 'Analytics + experiments', intro: 'Find where people struggle, form a useful hypothesis, and test whether a change actually helps.', steps: ['Detect friction', 'Form a hypothesis', 'Define success', 'Test a change', 'Keep or revert'], detail: 'Measure task completion, quality, retention, or another agreed outcome. Set guardrails before an experiment so extra clicks never become a substitute for user value.', output: 'Evidence for the next product decision.' },
  { id: 'content', title: 'A consistent voice, across every channel.', name: 'Social & content', tag: 'X · TikTok · beyond', intro: 'Turn product updates and company knowledge into channel-specific drafts, ready for the right review.', steps: ['Gather source material', 'Draft for the channel', 'Check voice & claims', 'Approve publication', 'Learn from response'], detail: 'Each company supplies its own voice, accounts, and publishing permissions. The workflow can prepare X posts, TikTok scripts, and other formats; account connections and publication need separate setup.', output: 'A reviewable content queue shaped by the company’s brand.' },
  { id: 'operations', title: 'Give repeatable work a repeatable system.', name: 'Company operations', tag: 'Connected workflows', intro: 'Bring recurring research, reporting, and administrative work into workflows with clear owners.', steps: ['Map the task', 'Connect approved tools', 'Run the workflow', 'Handle exceptions', 'Improve the process'], detail: 'Automate bounded tasks around company-specific tools and access. Route uncertain or consequential decisions to a person, with enough context to act.', output: 'Repeatable operations with a visible handoff when needed.' },
]
const companies = [
  { name: 'UTern', label: 'Independent company', copy: 'Not owned by SparkTech. A potential adopter of the same systems, using its own accounts, data, and approvals.', goal: 'Help people complete a useful career journey.' },
  { name: 'Ballot Watch', label: 'Listed studio work', copy: 'Part of the existing project roster. Shown here as a potential system connection, not a claim of a deployed integration or ownership.', goal: 'Make public information easier to understand.' },
  { name: 'LEED', label: 'Listed as leed.media', copy: 'The existing roster calls this project LEED. A potential system connection; ownership and integration status are not established here.', goal: 'Help useful reporting signals reach journalists.' },
  { name: 'Your company', label: 'Venture or outside team', copy: 'Adopt the capabilities that fit your product. Your company brings its own context and decides what the systems may do.', goal: 'Define the outcome that matters to your users.' },
]
const routeMap = { 'product-strategy': 'analytics', 'product-engineering': 'quality', 'ai-systems': 'operations', 'scale-operations': 'maintenance' }
const email = 'mailto:contactus@sparktechstudio.com'

function Arrow() { return <span aria-hidden="true">↗</span> }
function Brand() { return <a className="st-brand" href="/" aria-label="SparkTech Studio home"><img src="/logo.svg" alt="" /><b>ST/S</b><span>SparkTech<br />Studio</span></a> }

export default function Studio() {
  const [selected, setSelected] = useState(0)
  const slug = window.location.pathname.split('/')[2]
  const capability = systems.find(system => system.id === (routeMap[slug] || slug))
  useEffect(() => {
    document.body.classList.add('studio-page')
    document.title = capability ? `${capability.name} | SparkTech Studio` : 'SparkTech Studio | Build it. Keep it moving.'
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('st-visible'); observer.unobserve(entry.target) }
    }), { threshold: 0.08 })
    document.querySelectorAll('.st-reveal').forEach(el => observer.observe(el))
    return () => { document.body.classList.remove('studio-page'); observer.disconnect() }
  }, [capability])

  return <div className="studio">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="st-nav"><Brand /><nav aria-label="Main navigation"><a href="/#systems">The systems</a><a href="/#companies">The companies</a><a href="/#work">Our work</a></nav><a className="st-button st-nav-cta" href="#contact">Let’s build <Arrow /></a></header>
    <main id="main">
      {capability ? <section className="st-detail st-wrap"><a className="st-back" href="/#systems">← All systems</a><p className="st-eyebrow">{capability.name} / Planned capability</p><h1>{capability.title}</h1><p className="st-intro">{capability.intro}</p><div className="st-detail-body"><h2>How it would work.</h2><div><p>{capability.detail}</p><ol>{capability.steps.map(step => <li key={step}>{step}</li>)}</ol><p><strong>The output:</strong> {capability.output}</p></div></div><p className="st-note">This describes the system we intend to build. Availability and company connections are confirmed during scoping.</p></section> : <>
        <section className="st-hero st-wrap">
          <p className="st-eyebrow"><span className="st-spark">✳</span> An incubator. A product studio. A long-term operator.</p>
          <h1>Build it.<br /><em>Keep it moving.</em></h1>
          <p className="st-intro">We build websites and products, then build the systems to keep them improving. One studio. Shared capabilities. Each company’s own direction.</p>
          <div className="st-actions"><a className="st-button" href="#systems">Explore the systems <span aria-hidden="true">↓</span></a><a className="st-text-link" href="#contact">Bring us an idea <Arrow /></a></div>
          <div className="st-hero-foot"><span>From the first spark to the everyday work.</span><span>Built with AI. Directed by people.</span></div>
        </section>

        <section className="st-network st-wrap st-reveal" id="companies">
          <div className="st-section-top"><p className="st-eyebrow">The operating model</p><p className="st-caption">Proposed architecture / illustrative connections</p></div>
          <div className="st-network-head"><h2>Different companies.<br /><em>Common machinery.</em></h2><p>SparkTech is building a reusable layer of agentic systems. Our ventures and independent companies can adopt the same capabilities without sharing their company context.</p></div>
          <div className="st-machine">
            <div className="st-machine-core"><div className="st-core-title"><img src="/logo.svg" alt="" /><div><span className="st-eyebrow">SparkTech-owned systems</span><h3>The shared engine</h3></div><span className="st-status">Planned library</span></div><div className="st-modules">{systems.map(s => <a key={s.id} href={`#${s.id}`}>{s.name}<span aria-hidden="true">↘</span></a>)}</div></div>
            <div className="st-connector" aria-hidden="true"><span>Shared capabilities ↓</span><span>Company context ↑</span></div>
            <div className="st-company-buttons" aria-label="Explore a company connection">{companies.map((company, index) => <button key={company.name} aria-pressed={selected === index} onClick={() => setSelected(index)}><span>{company.name}</span><small>{index === 0 ? 'Independent' : index === 3 ? 'Open to outside teams' : 'Existing project roster'}</small></button>)}</div>
            <div className="st-company-context" aria-live="polite"><div><p className="st-eyebrow">{companies[selected].label}</p><h3>{companies[selected].name} brings the context.</h3><p>{companies[selected].copy}</p></div><div><div className="st-context-tags"><span>Data</span><span>Credentials</span><span>Brand</span><span>Goals</span><span>Permissions</span></div><p className="st-company-goal"><span>Illustrative goal</span>{companies[selected].goal}</p></div></div>
          </div>
        </section>

        <section className="st-systems st-wrap" id="systems"><div className="st-section-top"><p className="st-eyebrow">The system library</p><span className="st-caption">Designed to be reused. Configured for each company.</span></div><div className="st-system-heading st-reveal"><h2>The work after<br /><em>“it’s live.”</em></h2><div><p>Quality, maintenance, learning, content, operations. The recurring work becomes the system.</p><p className="st-note">Planned capabilities. This is the direction we’re building toward, not a live service dashboard.</p></div></div>
          <div className="st-system-list">{systems.map((system, index) => <details className="st-system" id={system.id} key={system.id} open={index === 0 ? true : undefined}><summary><span className="st-system-name">{system.name}</span><span className="st-system-tag">{system.tag}</span><span className="st-plus" aria-hidden="true">+</span></summary><div className="st-system-body"><div><h3>{system.title}</h3><p>{system.intro}</p><a className="st-text-link" href={`/capabilities/${system.id}`}>Inside this system <Arrow /></a></div><div className="st-loop"><p className="st-eyebrow">The intended loop</p><ol>{system.steps.map(step => <li key={step}><span aria-hidden="true" />{step}</li>)}</ol><p className="st-loop-return">↳ Evidence feeds the next pass</p></div></div></details>)}</div>
        </section>

        <section className="st-principle"><div className="st-wrap st-reveal"><p className="st-eyebrow">Our approach</p><h2>Automate the repetition.<br /><em>Stay accountable for the result.</em></h2><div className="st-principle-points"><p><strong>Build with a reason.</strong> Start with a useful product and a clear outcome, then put the automation around it.</p><p><strong>Give agents boundaries.</strong> Each company decides access, approvals, publishing, and release permissions.</p><p><strong>Close the loop.</strong> A proposed fix is not a verified fix. A busy dashboard is not a better product.</p></div></div></section>

        <section className="st-work st-wrap st-reveal" id="work"><div className="st-section-top"><p className="st-eyebrow">The project roster</p><span className="st-caption">Products before promises.</span></div><div className="st-work-heading"><h2>Ideas with<br /><em>a place in the world.</em></h2><p>Selected work from the studio’s existing roster. Inclusion does not imply ownership or an active connection to the new systems.</p></div><div className="st-projects">{projects.map(project => <a href={project.url} key={project.key} target="_blank" rel="noreferrer"><span className="st-project-name">{project.name}</span><span>{project.desc}</span><Arrow /></a>)}</div></section>
      </>}
      <section className="st-contact st-wrap" id="contact"><p className="st-eyebrow">Build with SparkTech</p><h2>A new idea?<br /><em>A product that needs more?</em></h2><p>Let’s talk about what to build, what to automate, and where people should stay in the loop.</p><a className="st-button" href={email}>Talk to the studio <Arrow /></a><a className="st-contact-email" href={email}>contactus@sparktechstudio.com</a></section>
    </main>
    <footer className="st-footer st-wrap"><Brand /><p>Build. Operate. Improve.</p><span>© {new Date().getFullYear()} SparkTech Studios, LLC</span><a href="#main">Back to top ↑</a></footer>
  </div>
}
