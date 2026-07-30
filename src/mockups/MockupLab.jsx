import { useEffect } from 'react'
import { projects } from '../data/projects'
import './MockupLab.css'

const conceptMeta = [
  {
    key: 'a',
    name: 'Refined Terminal',
    note: 'Current identity, tightened into a confident advisory studio.',
    palette: ['#0a0907', '#f3f0e7', '#d9a520'],
  },
  {
    key: 'b',
    name: 'Editorial Console',
    note: 'Current colors and terminal DNA, recast as a premium field memo.',
    palette: ['#f3f0e7', '#14130f', '#b8860b'],
  },
  {
    key: 'c',
    name: 'Signal Room',
    note: 'A bold control-room direction built around decisive judgment.',
    palette: ['#1a120e', '#fff1db', '#ff6b2c'],
  },
  {
    key: 'd',
    name: 'Practice Notes',
    note: 'A modern advisory practice with architectural structure and wit.',
    palette: ['#f4f0e8', '#173b2d', '#e34b32'],
  },
]

const processSteps = [
  ['01', 'Decide', 'Pressure-test the idea, the market, and the hard parts before a line of code.'],
  ['02', 'Build', 'Senior engineers turn the plan into working software with AI accelerating the volume.'],
  ['03', 'Harden', 'We handle the unglamorous parts: data, security, payments, cost, and edge cases.'],
  ['04', 'Scale', 'We stay for real users, real traffic, and the decisions that only appear after launch.'],
]

const capabilityPages = {
  'product-strategy': {
    slug: 'product-strategy',
    label: 'Product strategy',
    eyebrow: 'Capability 01',
    title: ['Decide what deserves', 'to exist.'],
    intro: 'We turn a promising idea into a small set of decisions: who it is for, what must be true, and what can wait.',
    principle: 'The roadmap is not the strategy. The decisions behind it are.',
    argument: 'We pressure-test the customer, the market, the operating model, and the hard technical edges before momentum turns assumptions into expensive commitments.',
    deliverables: [
      'A sharp product brief with the customer, problem, and bet stated plainly.',
      'A prototype or technical spike that tests the riskiest assumption first.',
      'A release scope small enough to ship and meaningful enough to learn from.',
      'Architecture, cost, and operating notes the build team can act on immediately.',
    ],
    steps: [
      ['Frame', 'Name the decision, the evidence it needs, and what would change our mind.'],
      ['Prove', 'Test the weakest assumption with customers, prototypes, or working code.'],
      ['Sequence', 'Choose the smallest release that creates a real signal, then put it in order.'],
    ],
    next: 'product-engineering',
  },
  'product-engineering': {
    slug: 'product-engineering',
    label: 'Product engineering',
    eyebrow: 'Capability 02',
    title: ['Senior builders, from', 'first commit to launch.'],
    intro: 'We translate the product decision into production software without handing the thinking to a separate delivery team.',
    principle: 'The people making the architecture calls stay close to the product calls.',
    argument: 'That means fewer handoffs, less translation loss, and a build that can move quickly without leaving a maze for the next team to untangle.',
    deliverables: [
      'A working product shaped around the actual release decision.',
      'Production architecture with data, security, and operating cost considered early.',
      'Tests and release controls focused on the failures that would hurt users most.',
      'Clear ownership through launch, feedback, and the next round of decisions.',
    ],
    steps: [
      ['Scope', 'Turn the product bet into a release boundary the team can defend.'],
      ['Build', 'Ship in small, reviewable cuts with senior judgment on every hard edge.'],
      ['Launch', 'Put it in front of real users, watch what happens, and respond while the signal is fresh.'],
    ],
    next: 'ai-systems',
  },
  'ai-systems': {
    slug: 'ai-systems',
    label: 'AI systems',
    eyebrow: 'Capability 03',
    title: ['Put AI where it', 'earns its keep.'],
    intro: 'We find the product moments where models create real value, then build the system that makes their output useful, safe, and understandable.',
    principle: 'A model is only one part of the product. Judgment belongs around it.',
    argument: 'We combine model capability with senior engineering, clear evaluation, human review, and the data systems required to know when the output is helping.',
    deliverables: [
      'A clear use case with success criteria tied to a real user decision.',
      'Model and workflow prototypes evaluated against representative inputs.',
      'Guardrails, review paths, and failure handling built into the experience.',
      'Production instrumentation for quality, latency, cost, and model drift.',
    ],
    steps: [
      ['Choose', 'Start with the user decision, not the model or the demo.'],
      ['Connect', 'Build the data, tools, and product workflow around the model.'],
      ['Govern', 'Measure quality, expose uncertainty, and keep people in control of the important calls.'],
    ],
    next: 'scale-operations',
  },
  'scale-operations': {
    slug: 'scale-operations',
    label: 'Scale + operations',
    eyebrow: 'Capability 04',
    title: ['Make growth', 'boring.'],
    intro: 'We harden the product across reliability, data, security, cost, and operations before traffic turns a small weakness into a large incident.',
    principle: 'Scale is not one infrastructure project. It is a sequence of operating decisions.',
    argument: 'We find the parts most likely to break, instrument what matters, and improve the system in the order that protects users and preserves momentum.',
    deliverables: [
      'A ranked view of reliability, security, data, and cost risks.',
      'Instrumentation that shows where the product is slow, fragile, or expensive.',
      'Targeted architecture and operational changes tied to observed pressure.',
      'Runbooks, ownership, and feedback loops that keep the system understandable.',
    ],
    steps: [
      ['Observe', 'Measure the user path, the system path, and the bill before guessing.'],
      ['Harden', 'Fix the risks with the highest consequence, not the loudest symptoms.'],
      ['Own', 'Stay through real traffic and make the next decision with live evidence.'],
    ],
    next: 'product-strategy',
  },
}

function BrandMark({ compact = false }) {
  return (
    <span className={`mock-brand ${compact ? 'mock-brand--compact' : ''}`}>
      <img src="/logo.svg" alt="" />
      <span>SparkTech Studio</span>
    </span>
  )
}

function LabNav({ active }) {
  return (
    <nav className="lab-nav" aria-label="Mockup navigation">
      <a className="lab-nav-home" href="/mockups">All concepts</a>
      <div className="lab-nav-options" aria-label="Choose a concept">
        {conceptMeta.map((concept) => (
          <a
            key={concept.key}
            className={active === concept.key ? 'is-active' : ''}
            href={`/mockups/${concept.key}`}
            aria-label={`View concept ${concept.key.toUpperCase()}: ${concept.name}`}
          >
            {concept.key.toUpperCase()}
          </a>
        ))}
      </div>
      <a className="lab-nav-site" href="/">Current site</a>
    </nav>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  )
}

function OverviewPreview({ concept }) {
  if (concept.key === 'a') {
    return (
      <div className="overview-preview preview-a">
        <div className="preview-a-nav"><i /><span /><b /></div>
        <div className="preview-a-copy"><small>ADVISORY + ENGINEERING</small><strong>Make the right thing.</strong><em>Then make it hold.</em><button /></div>
        <div className="preview-a-proof"><span /><span /><span /></div>
      </div>
    )
  }

  if (concept.key === 'b') {
    return (
      <div className="overview-preview preview-b">
        <div className="preview-b-rule" />
        <div className="preview-b-grid">
          <div><small>FIELD MEMO 001</small><strong>Judgment is<br />the product.</strong><p /></div>
          <div className="preview-b-photo" />
        </div>
        <div className="preview-b-footer"><i /><i /><i /></div>
      </div>
    )
  }

  if (concept.key === 'c') {
    return (
      <div className="overview-preview preview-c">
        <div className="preview-c-top"><span>SPARKTECH</span><i /></div>
        <strong>BUILD<br /><em>LESS.</em><br />WIN MORE.</strong>
        <div className="preview-c-orbit"><i /><i /><i /></div>
        <button />
      </div>
    )
  }

  return (
    <div className="overview-preview preview-d">
      <div className="preview-d-top"><b>ST/S</b><img src="/logo.svg" alt="" /><span /><span /></div>
      <small>SPARKTECH / ADVISORY PRACTICE</small>
      <strong>Good advice<br />should leave<br /><em>fingerprints.</em></strong>
      <div className="preview-d-grid"><span /><span /><span /></div>
    </div>
  )
}

function MockupOverview() {
  return (
    <main className="mockup-overview">
      <header className="overview-header">
        <a href="/" className="overview-brand"><BrandMark /></a>
        <span>Landing page exploration / 04 directions</span>
      </header>

      <section className="overview-intro">
        <p className="overview-kicker">SparkTech Studio</p>
        <h1>Four ways to make<br />“advice that ships” feel real.</h1>
        <p>
          A and B refine the current cream, ink, gold, and terminal identity.
          C and D explore what the studio could become with a wider brief.
        </p>
      </section>

      <section className="overview-grid" aria-label="Landing page concepts">
        {conceptMeta.map((concept, index) => (
          <a className={`overview-card overview-card--${concept.key}`} href={`/mockups/${concept.key}`} key={concept.key}>
            <OverviewPreview concept={concept} />
            <div className="overview-card-copy">
              <div>
                <span className="overview-index">0{index + 1}</span>
                <h2>{concept.name}</h2>
              </div>
              <p>{concept.note}</p>
              <div className="overview-card-foot">
                <span className="overview-palette">
                  {concept.palette.map((color) => <i key={color} style={{ background: color }} />)}
                </span>
                <span className="overview-open">Open concept <ArrowIcon /></span>
              </div>
            </div>
          </a>
        ))}
      </section>

      <footer className="overview-footer">
        <p>Each concept is responsive and uses the same real SparkTech positioning and work roster.</p>
        <a href="/">Return to current site</a>
      </footer>
    </main>
  )
}

function ConceptA() {
  return (
    <main className="concept concept-a">
      <header className="a-nav">
        <a href="#a-top"><BrandMark /></a>
        <div className="a-nav-links">
          <a href="#a-thesis">Thesis</a>
          <a href="#a-approach">Approach</a>
          <a href="#a-work">Work</a>
        </div>
        <a className="a-nav-cta" href="#a-contact">Start a project <ArrowIcon /></a>
      </header>

      <section className="a-hero" id="a-top">
        <div className="a-hero-image" aria-hidden="true">
          <img src="/transistor.jpg" alt="" />
        </div>
        <div className="a-hero-scrim" />
        <div className="a-hero-grid">
          <div className="a-hero-copy">
            <p className="a-eyebrow"><span>●</span> Advisory + product engineering</p>
            <h1>Make the right thing.<br /><em>Then make it hold.</em></h1>
            <p className="a-hero-lead">
              SparkTech is the senior team behind ambitious software. We challenge the plan,
              build the product, and stay when real users arrive.
            </p>
            <div className="a-actions">
              <a className="a-button" href="#a-contact">Start a conversation <ArrowIcon /></a>
              <a className="a-text-link" href="#a-work">See selected work <span>↓</span></a>
            </div>
          </div>
          <aside className="a-hero-aside">
            <span className="a-aside-label">Our operating principle</span>
            <p>Judgment first.<br />Engineering second.<br />Ownership throughout.</p>
            <span className="a-aside-code">sparktech@studio:~$ ready_</span>
          </aside>
        </div>
        <div className="a-proof">
          <div><strong>06</strong><span>products live</span></div>
          <div><strong>01</strong><span>senior team from strategy to scale</span></div>
          <div><strong>0</strong><span>decks handed off without execution</span></div>
        </div>
      </section>

      <section className="a-thesis" id="a-thesis">
        <header>
          <span>01 / The thesis</span>
          <h2>Building got cheap.<br />Deciding what to build did not.</h2>
        </header>
        <div className="a-thesis-body">
          <p>
            AI can produce more code than ever. It cannot tell you which product deserves
            to exist, where it breaks, or when the smart move is to stop.
          </p>
          <p>
            That is the work. We bring product judgment, senior engineering, and the
            willingness to own the outcome after launch.
          </p>
          <a href="#a-approach">See how we work <ArrowIcon /></a>
        </div>
      </section>

      <section className="a-approach" id="a-approach">
        <div className="a-section-head">
          <span>02 / The approach</span>
          <h2>One team. Four hard conversations.</h2>
          <p>No theater. No mystery phase. Every step ends with something you can use.</p>
        </div>
        <ol className="a-process">
          {processSteps.map(([n, title, copy]) => (
            <li key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="a-work" id="a-work">
        <div className="a-section-head">
          <span>03 / Selected work</span>
          <h2>Proof that runs in production.</h2>
        </div>
        <div className="a-work-list">
          {projects.map((project, index) => (
            <a href={project.url} target="_blank" rel="noreferrer" key={project.key}>
              <span className="a-work-index">0{index + 1}</span>
              <span className="a-work-logo"><img src={project.logo} alt="" /></span>
              <span className="a-work-title">
                <strong>{project.name}</strong>
                <small>{project.desc}</small>
              </span>
              <span className="a-work-tags">{project.tags.slice(0, 2).join(' / ')}</span>
              <span className="a-work-arrow">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="a-contact" id="a-contact">
        <div>
          <p>Have an ambitious idea or a product starting to buckle?</p>
          <h2>Bring us the thing<br />you cannot stop thinking about.</h2>
        </div>
        <a href="mailto:contactus@sparktechstudio.com">
          contactus@sparktechstudio.com <ArrowIcon />
        </a>
      </section>

      <footer className="a-footer">
        <BrandMark />
        <span>© {new Date().getFullYear()} SparkTech Studios, LLC</span>
        <span>New York / Building everywhere</span>
      </footer>
    </main>
  )
}

function ConceptB() {
  return (
    <main className="concept concept-b">
      <header className="b-nav">
        <a href="#b-top" className="b-logo"><BrandMark /></a>
        <span className="b-issue">Field memo / No. 001</span>
        <nav aria-label="Concept B sections">
          <a href="#b-argument">Argument</a>
          <a href="#b-work">Work</a>
          <a href="#b-contact">Contact</a>
        </nav>
      </header>

      <section className="b-hero" id="b-top">
        <div className="b-hero-copy">
          <p className="b-kicker">A product advisory practice that builds</p>
          <h1>Judgment is<br />the product.</h1>
          <p className="b-deck">
            We help ambitious teams decide what is worth building, then put a senior
            product and engineering team behind the answer.
          </p>
          <div className="b-actions">
            <a href="#b-contact">Discuss a project</a>
            <a href="#b-argument">Read our argument ↓</a>
          </div>
        </div>
        <figure className="b-hero-figure">
          <div className="b-image-frame">
            <img src="/transistor.jpg" alt="Macro photograph of a transistor" />
            <span className="b-image-mark">ST / 01</span>
          </div>
          <figcaption>
            <span>Silicon made production cheap.</span>
            <span>Good decisions got more valuable.</span>
          </figcaption>
        </figure>
      </section>

      <section className="b-ticker" aria-label="Studio capabilities">
        <span>Product strategy</span>
        <i>◆</i>
        <span>AI systems</span>
        <i>◆</i>
        <span>Web + mobile</span>
        <i>◆</i>
        <span>Scale + operations</span>
      </section>

      <section className="b-argument" id="b-argument">
        <aside>
          <span>Our argument</span>
          <p>Three claims.<br />One operating model.</p>
        </aside>
        <div className="b-argument-list">
          <article>
            <span>1</span>
            <div>
              <h2>Building is no longer the bottleneck.</h2>
              <p>AI collapsed the distance between an idea and code that runs. More teams can make more software, faster.</p>
            </div>
          </article>
          <article>
            <span>2</span>
            <div>
              <h2>Comprehension is.</h2>
              <p>Output outruns understanding. Architecture, product taste, and knowing what not to ship now matter more.</p>
            </div>
          </article>
          <article>
            <span>3</span>
            <div>
              <h2>Advice should ship with the work.</h2>
              <p>We make the call, build the system, and stay close enough to be accountable for what happens next.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="b-method">
        <header>
          <span>The working relationship</span>
          <h2>Four verbs. No black box.</h2>
        </header>
        <div className="b-method-grid">
          {processSteps.map(([n, title, copy]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="b-work" id="b-work">
        <header>
          <span>Selected work / live products</span>
          <h2>Built to leave the pitch deck.</h2>
        </header>
        <div className="b-work-table">
          <div className="b-work-table-head">
            <span>Product</span><span>What it does</span><span>Field</span><span>Status</span>
          </div>
          {projects.map((project) => (
            <a href={project.url} target="_blank" rel="noreferrer" key={project.key}>
              <span className="b-project-name"><img src={project.logo} alt="" />{project.name}</span>
              <span>{project.desc}</span>
              <span>{project.tags[0]}</span>
              <span>Live ↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="b-contact" id="b-contact">
        <p>Every good engagement starts with an honest conversation.</p>
        <h2>What are you trying<br />to make true?</h2>
        <a href="mailto:contactus@sparktechstudio.com">Write to the team <ArrowIcon /></a>
      </section>

      <footer className="b-footer">
        <BrandMark />
        <p>Advisors who ship.<br />Not consultants who hand you a deck.</p>
        <span>contactus@sparktechstudio.com</span>
      </footer>
    </main>
  )
}

function ConceptC() {
  return (
    <main className="concept concept-c">
      <header className="c-nav">
        <a href="#c-top" className="c-wordmark">SPARKTECH<span>STUDIO</span></a>
        <div className="c-nav-center">
          <a href="#c-thesis">Thesis</a>
          <a href="#c-system">System</a>
          <a href="#c-work">Work</a>
        </div>
        <a className="c-nav-cta" href="#c-contact">Open a channel <span>↗</span></a>
      </header>

      <section className="c-hero" id="c-top">
        <div className="c-grid-bg" aria-hidden="true" />
        <div className="c-orbit" aria-hidden="true">
          <i /><i /><i />
          <span>JUDGMENT</span>
        </div>
        <div className="c-hero-copy">
          <p><span>●</span> Senior product advisory / New York</p>
          <h1>BUILD <em>LESS.</em><br />WIN MORE.</h1>
          <div className="c-hero-bottom">
            <p>
              More code is not the answer. Better calls are. We decide what matters,
              build it fast, and make sure it survives contact with reality.
            </p>
            <a href="#c-contact">Bring us the hard one <ArrowIcon /></a>
          </div>
        </div>
        <aside className="c-status">
          <span>SYSTEM STATUS</span>
          <strong>06</strong>
          <p>products running<br />in the real world</p>
          <i>ALL SYSTEMS LIVE</i>
        </aside>
      </section>

      <section className="c-manifesto" id="c-thesis">
        <div className="c-manifesto-label">01 / Our position</div>
        <div className="c-manifesto-copy">
          <p>AI gave everyone a factory.</p>
          <h2>We bring the<br /><em>editorial judgment.</em></h2>
          <div className="c-manifesto-columns">
            <p>
              What gets made, what gets cut, where the product breaks, and when
              enough is enough. Those calls now create more value than raw output.
            </p>
            <p>
              SparkTech combines that judgment with the senior team to ship the
              answer. Strategy and execution share one owner.
            </p>
          </div>
        </div>
      </section>

      <section className="c-system" id="c-system">
        <header>
          <span>02 / Operating system</span>
          <h2>Four moves.<br />One accountable team.</h2>
        </header>
        <div className="c-system-steps">
          {processSteps.map(([n, title, copy]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <i />
            </article>
          ))}
        </div>
      </section>

      <section className="c-work" id="c-work">
        <header>
          <span>03 / Live signals</span>
          <h2>Products with a pulse.</h2>
        </header>
        <div className="c-work-grid">
          {projects.map((project, index) => (
            <a href={project.url} target="_blank" rel="noreferrer" key={project.key}>
              <span className="c-work-number">0{index + 1}</span>
              <img src={project.logo} alt="" />
              <div>
                <h3>{project.name}</h3>
                <p>{project.desc}</p>
              </div>
              <span className="c-work-link">LIVE ↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="c-contact" id="c-contact">
        <div className="c-contact-grid" aria-hidden="true" />
        <p>THE CHANNEL IS OPEN</p>
        <h2>What is the decision<br />you cannot afford to get wrong?</h2>
        <a href="mailto:contactus@sparktechstudio.com">
          contactus@sparktechstudio.com <span>↗</span>
        </a>
      </section>

      <footer className="c-footer">
        <span>SPARKTECH STUDIO / ADVICE THAT SHIPS</span>
        <span>NYC / {new Date().getFullYear()}</span>
      </footer>
    </main>
  )
}

function DHeader({ isHome, basePath }) {
  const homePath = basePath || '/'
  const sectionHref = (id) => (isHome ? `#${id}` : `${homePath}#${id}`)

  return (
    <header className="d-nav">
      <a href={sectionHref('d-top')} className="d-brand-lockup" aria-label="SparkTech Studio">
        <img src="/logo.svg" alt="" />
        <span className="d-monogram-main">ST<i>/</i>S</span>
      </a>
      <nav aria-label="Studio sections">
        <a href={sectionHref('d-practice')}>Practice</a>
        <a href={sectionHref('d-work')}>Index</a>
        <a href={sectionHref('d-contact')}>Contact</a>
      </nav>
    </header>
  )
}

function DFooter({ isHome, activeCapability, basePath }) {
  const homePath = basePath || '/'
  const capabilityPath = (slug) => `${basePath}/capabilities/${slug}`
  const sectionHref = (id) => (isHome ? `#${id}` : `${homePath}#${id}`)

  return (
    <footer className="d-footer">
      <div className="d-footer-primary d-reveal">
        <div>
          <a href={sectionHref('d-top')} className="d-footer-brand" aria-label="SparkTech Studio">
            <img src="/logo.svg" alt="" />
            <span className="d-monogram-main">ST<i>/</i>S</span>
          </a>
          <p>Senior product judgment, engineering, and ownership for ambitious software.</p>
        </div>
        <a className="d-footer-email" href="mailto:contactus@sparktechstudio.com">
          contactus@sparktechstudio.com
        </a>
      </div>

      <div className="d-footer-nav">
        <div className="d-reveal">
          <h3>Studio</h3>
          <a href={sectionHref('d-top')}>Home</a>
          <a href={sectionHref('d-practice')}>Practice</a>
          <a href={sectionHref('d-method')}>Method</a>
          <a href={sectionHref('d-work')}>Work</a>
          <a href={sectionHref('d-contact')}>Contact</a>
        </div>
        <div className="d-reveal">
          <h3>Capabilities</h3>
          {Object.values(capabilityPages).map((capability) => (
            <a
              href={capabilityPath(capability.slug)}
              aria-current={activeCapability === capability.slug ? 'page' : undefined}
              key={capability.slug}
            >
              {capability.label}
            </a>
          ))}
        </div>
        <div className="d-reveal">
          <h3>Selected work</h3>
          {projects.map((project) => (
            <a href={project.url} target="_blank" rel="noreferrer" key={project.key}>
              {project.name}
            </a>
          ))}
        </div>
        <div className="d-reveal">
          <h3>Connect</h3>
          <a href="mailto:contactus@sparktechstudio.com">Email the studio</a>
          <a href={sectionHref('d-contact')}>Start a project</a>
        </div>
      </div>

      <div className="d-footer-meta d-reveal">
        <span>© {new Date().getFullYear()} SparkTech Studios, LLC</span>
        <span>Advice that ships. Days, not weeks.</span>
      </div>
    </footer>
  )
}

function ConceptDCapability({ capability, basePath }) {
  const nextCapability = capabilityPages[capability.next]
  const homePath = basePath || '/'
  const capabilityPath = (slug) => `${basePath}/capabilities/${slug}`

  return (
    <>
      <section className="d-capability-hero" id="d-top">
        <div>
          <nav className="d-capability-breadcrumb" aria-label="Breadcrumb">
            <a href={homePath}>Studio</a>
            <span aria-hidden="true">/</span>
            <span>Capabilities</span>
            <span aria-hidden="true">/</span>
            <strong>{capability.label}</strong>
          </nav>
          <p className="d-capability-label">{capability.eyebrow}</p>
          <h1>{capability.title[0]}<br /><em>{capability.title[1]}</em></h1>
          <p className="d-capability-intro">{capability.intro}</p>
          <p className="d-capability-speed">
            <span>Operating pace</span>
            Days, not weeks.
          </p>
        </div>
      </section>

      <section className="d-capability-argument">
        <div className="d-reveal">
          <span>The point</span>
          <h2>{capability.principle}</h2>
        </div>
        <p className="d-reveal">{capability.argument}</p>
      </section>

      <section className="d-capability-outputs">
        <header className="d-reveal">
          <span>What the work produces</span>
          <h2>Concrete enough<br />to act on.</h2>
        </header>
        <ol>
          {capability.deliverables.map((deliverable, index) => (
            <li className="d-reveal" key={deliverable}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{deliverable}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="d-capability-method">
        <header className="d-reveal">
          <span>How we move</span>
          <h2>Fast because the decisions<br />stay close to the work.</h2>
        </header>
        <ol>
          {capability.steps.map(([title, copy], index) => (
            <li className="d-reveal" key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="d-capability-cta">
        <div className="d-reveal">
          <span>Start here</span>
          <h2>Bring us the decision.<br />We will help make it real.</h2>
          <a href="mailto:contactus@sparktechstudio.com">
            Start with the question <ArrowIcon />
          </a>
        </div>
        <a
          className="d-capability-next d-scroll-motion"
          href={capabilityPath(nextCapability.slug)}
        >
          <span>Next capability</span>
          <strong>{nextCapability.label}</strong>
          <ArrowIcon />
        </a>
      </section>
    </>
  )
}

function ConceptD({ capabilitySlug, basePath }) {
  const capability = capabilityPages[capabilitySlug]

  useEffect(() => {
    const root = document.querySelector('.concept-d')
    const revealItems = [...document.querySelectorAll('.concept-d .d-reveal')]
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const supportsIntersectionObserver = 'IntersectionObserver' in window
    const previousTitle = document.title
    document.title = capability
      ? `${capability.label} | SparkTech Studio`
      : 'SparkTech Studio'

    if (!root || prefersReducedMotion || !supportsIntersectionObserver) {
      revealItems.forEach((item) => item.classList.add('is-visible'))
      return () => {
        document.title = previousTitle
      }
    }

    root.classList.add('is-motion-ready')
    const navLinks = [...root.querySelectorAll('.d-nav nav a[href^="#"]')]
    const navSections = navLinks
      .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
      .filter(Boolean)
    let scrollFrame = 0

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.12 })

    revealItems.forEach((item, index) => {
      item.style.setProperty('--d-reveal-delay', `${(index % 4) * 70}ms`)
      observer.observe(item)
    })

    const revealItemsInView = () => {
      const revealLine = window.innerHeight * 0.92

      revealItems.forEach((item) => {
        if (item.classList.contains('is-visible')) return

        const bounds = item.getBoundingClientRect()
        if (bounds.bottom <= 0 || bounds.top >= revealLine) return

        item.classList.add('is-visible')
        observer.unobserve(item)
      })
    }

    const updateScrollState = () => {
      revealItemsInView()

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll))
      const marker = window.innerHeight * 0.38
      let activeSection

      navSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= marker) activeSection = section
      })

      root.style.setProperty('--d-scroll-progress', progress)
      root.classList.toggle('is-scrolled', window.scrollY > 36)

      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${activeSection?.id}`
        link.classList.toggle('is-current', isCurrent)
        if (isCurrent) link.setAttribute('aria-current', 'location')
        else link.removeAttribute('aria-current')
      })
      scrollFrame = 0
    }

    const queueScrollUpdate = () => {
      if (scrollFrame) return
      scrollFrame = window.requestAnimationFrame(updateScrollState)
    }

    updateScrollState()
    window.addEventListener('scroll', queueScrollUpdate, { passive: true })
    window.addEventListener('resize', queueScrollUpdate)

    return () => {
      window.removeEventListener('scroll', queueScrollUpdate)
      window.removeEventListener('resize', queueScrollUpdate)
      window.cancelAnimationFrame(scrollFrame)
      observer.disconnect()
      root.style.removeProperty('--d-scroll-progress')
      root.classList.remove('is-motion-ready')
      root.classList.remove('is-scrolled')
      document.title = previousTitle
    }
  }, [capability])

  return (
    <main className="concept concept-d">
      <div className="d-scroll-progress" aria-hidden="true" />
      <DHeader isHome={!capability} basePath={basePath} />

      {capability ? (
        <ConceptDCapability capability={capability} basePath={basePath} />
      ) : (
        <>
          <section className="d-hero" id="d-top">
            <div className="d-hero-main">
              <p className="d-hero-speed">
                <span>Operating pace</span>
                We ship in days, not weeks.
              </p>
              <h1>Good advice<br />should leave<br /><em>fingerprints.</em></h1>
              <div className="d-hero-intro">
                <p>
                  We help teams choose the right product, shape it until it is sharp,
                  then put senior builders behind every claim.
                </p>
                <a href="mailto:contactus@sparktechstudio.com">
                  Start with the question <ArrowIcon />
                </a>
              </div>
            </div>
          </section>

          <section className="d-practice" id="d-practice">
            <header className="d-reveal">
              <span>Practice</span>
              <h2>An advisory practice<br />that builds.</h2>
            </header>
            <div className="d-practice-grid">
              <article className="d-practice-lead d-reveal">
                <p>We advise first. Then we ship in days, not weeks.</p>
              </article>
              <article className="d-reveal">
                <span>What you bring</span>
                <h3>A decision worth getting right.</h3>
                <p>An early idea, a product with traction, or a system beginning to strain.</p>
              </article>
              <article className="d-reveal">
                <span>What we bring</span>
                <h3>Judgment with follow-through.</h3>
                <p>Product strategy, architecture, senior engineering, and ongoing ownership.</p>
              </article>
            </div>
          </section>

          <section className="d-decisions" id="d-method">
            <div className="d-decision-intro d-reveal">
              <span>Method</span>
              <h2>The work is a sequence<br />of better decisions.</h2>
              <p className="d-method-speed">
                Fewer handoffs. Faster calls. Working software while the problem is still sharp.
              </p>
            </div>
            <ol>
              {processSteps.map(([n, title, copy]) => (
                <li className="d-reveal" key={n}>
                  <span>{n}</span>
                  <div><h3>{title}</h3><p>{copy}</p></div>
                </li>
              ))}
            </ol>
          </section>

          <section className="d-work" id="d-work">
            <header className="d-scroll-motion">
              <span>Selected work</span>
              <h2>Products we helped<br />launch.</h2>
              <p>Real products, live, with real users. Every link opens the thing we shipped.</p>
            </header>
            <div className="d-launch-tree">
              <div className="d-launch-root d-scroll-motion">
                <img src="/logo.svg" alt="" />
                <span>sparktech-studio/launches</span>
              </div>
              <ul>
                {projects.map((project, index) => {
                  const last = index === projects.length - 1
                  return (
                    <li className="d-launch-row d-scroll-motion" key={project.key}>
                      <span className="d-launch-glyph" aria-hidden="true">{last ? '└──' : '├──'}</span>
                      <a href={project.url} target="_blank" rel="noreferrer">
                        <div className="d-launch-bar">
                          <span className="d-launch-logo">
                            <img src={project.logo || '/logo.svg'} alt="" loading="lazy" />
                          </span>
                          <strong>{project.name}</strong>
                          <span className={`d-launch-status d-launch-status--${project.status}`}>
                            [{project.status}]
                          </span>
                          <b aria-hidden="true">↗</b>
                        </div>
                        <div className="d-launch-body">
                          <p>{project.desc}</p>
                          <div>
                            {project.tags.map((tag) => <span key={tag}>#{tag}</span>)}
                          </div>
                        </div>
                      </a>
                    </li>
                  )
                })}
              </ul>
              <p className="d-launch-footnote d-scroll-motion">
                Fast only matters if it stays standing. Every project here is in production.
              </p>
            </div>
          </section>

          <section className="d-contact" id="d-contact">
            <div className="d-reveal">
              <span>Correspondence</span>
              <h2>Bring us the decision<br />you cannot afford<br />to get wrong.</h2>
            </div>
            <div className="d-contact-note d-reveal">
              <p>
                No form. No qualification maze. One email goes directly to the people
                who would advise and build the work.
              </p>
              <a href="mailto:contactus@sparktechstudio.com">
                contactus@sparktechstudio.com <ArrowIcon />
              </a>
            </div>
          </section>
        </>
      )}

      <DFooter
        isHome={!capability}
        activeCapability={capability?.slug}
        basePath={basePath}
      />
    </main>
  )
}

export default function MockupLab() {
  const pathSegments = window.location.pathname.split('/').filter(Boolean)
  const isMockupRoute = pathSegments[0] === 'mockups'
  const segment = isMockupRoute ? pathSegments[1]?.toLowerCase() : 'd'
  const active = ['a', 'b', 'c', 'd'].includes(segment) ? segment : null
  const capabilitySlug = isMockupRoute
    ? (
        segment === 'd' && pathSegments[2] === 'capabilities'
          ? pathSegments[3]?.toLowerCase()
          : undefined
      )
    : (
        pathSegments[0] === 'capabilities'
          ? pathSegments[1]?.toLowerCase()
          : undefined
      )
  const dBasePath = isMockupRoute ? '/mockups/d' : ''

  useEffect(() => {
    document.body.classList.add('mockup-lab-active')
    document.documentElement.classList.add('mockup-lab-active')

    const targetId = window.location.hash.slice(1)
    const frame = window.requestAnimationFrame(() => {
      const target = targetId ? document.getElementById(targetId) : null
      if (target) {
        target.scrollIntoView()
      } else {
        window.scrollTo(0, 0)
      }
    })

    return () => {
      window.cancelAnimationFrame(frame)
      document.body.classList.remove('mockup-lab-active')
      document.documentElement.classList.remove('mockup-lab-active')
    }
  }, [active])

  if (!active) return <MockupOverview />

  const concepts = {
    a: <ConceptA />,
    b: <ConceptB />,
    c: <ConceptC />,
    d: <ConceptD capabilitySlug={capabilitySlug} basePath={dBasePath} />,
  }

  return (
    <>
      {concepts[active]}
      {isMockupRoute && <LabNav active={active} />}
    </>
  )
}
