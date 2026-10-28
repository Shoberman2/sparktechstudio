// Shared copy for the design directions and the company pages. Facts come from each company's own repo and live site (checked 2026-10-15).
// Shipped and vision are kept apart on purpose. UTern is an independent company; nothing here asserts SparkTech ownership of any of them.
export const EMAIL = 'contactus@sparktechstudio.com'
export const CALENDLY = 'https://calendly.com/spencerhoberman-utern/30min'
export const year = new Date().getFullYear()

export const companies = [
  {
    slug: 'utern', name: 'UTern', host: 'utern.ai', url: 'https://utern.ai', line: 'Your AI for landing an internship.',
    theme: { '--c-bg': '#0d1420', '--c-accent': '#f0a24a', '--c-scrim': 'linear-gradient(90deg, rgba(8,14,24,.1) 0%, rgba(8,14,24,.35) 40%, rgba(8,14,24,.82) 75%, rgba(8,14,24,.88) 100%)' },
    bg: '/work/utern/mountain.webp', bgMobile: '/work/utern/mountain-mobile.webp', figure: '/work/utern/birdee.webp', figureAlt: 'Birdee, UTern’s AI',
    kicker: 'Your AI for landing an internship',
    value: <>From enrollment <em>to employment.</em></>,
    lede: 'Birdee, UTern’s AI, finds students real internships that fit and brings companies the students who fit their role. Companies see evidence, never scores.',
    visionTitle: <>The climb, <em>start to summit.</em></>,
    today: ['Only the internships that fit you', 'Everything you do becomes a skill', 'Prove it in a conversation with Birdee', 'Apply with Birdee, side by side', 'Just graduated? Full-time roles too', 'Companies come to you. You say yes before they see you'],
    vision: ['Classes, handled', 'Paid projects, for credit', 'Applications, sent once you approve them', 'Hire from real work, any role', 'One view for the career office', 'Your transcript, read'],
    howTitle: <>Find, prove, apply. <em>Then companies come to you.</em></>,
    how: [
      ['Find', 'Birdee reads live internships every day and brings you the few that fit your record.'],
      ['Prove', 'Tell Birdee about a project, a job or your GitHub. It asks real questions and turns your answers into your record.'],
      ['Stand out', 'Birdee turns what you’ve done into your next AI project, the course worth taking, and who to reach out to.'],
      ['Apply with Birdee', 'Side by side: Birdee drafts each answer from your record, the form fills as you edit, and you submit it yourself.'],
      ['Companies come to you', 'Companies hiring on UTern read your record without your name or photo. Nothing is shared until you say yes.'],
    ],
    howNote: 'For companies: tell Birdee the role, it finds who fits, every record is checked blind, and you meet the few who fit. Posting is free; you pay only if you hire.',
    visual: 'climb', note: 'UTern is an independent company. Coming items are the vision, not shipped features.',
  },
  {
    slug: 'leed', name: 'Leed', host: 'leed.media', url: 'https://www.leed.media', line: 'Every tip, read and kept safe.',
    theme: { '--c-bg': '#0b0b09', '--c-accent': '#e9e4d6', '--c-mute': 'rgba(240,236,226,.6)' },
    bg: '/work/leed/newsrooms.webp', figure: '/work/leed/sherlock.svg', figureAlt: 'Sherlock, Leed’s desk agent', figureClass: 'is-sherlock',
    kicker: 'A private story-intelligence desk for newsrooms',
    value: <>Every tip your newsroom gets, <em>read, sorted, and kept safe.</em></>,
    lede: 'Tips land everywhere: inboxes, DMs, voicemail. Leed pulls them into one private desk, groups the ones about the same story, and keeps every source sealed until they say yes.',
    visionTitle: <>Scattered tips. <em>One private desk.</em></>,
    today: ['Sources send tips through a guided chat. No account, no name', 'AI turns every tip into a brief: the claim, how to check it, the risk to the source', 'Tips about the same story get grouped, so you see the pattern first', 'Reporters can ask to talk. The source says yes or no, and their name stays sealed until yes', 'Sherlock, the AI desk agent, ranks what moved overnight. It never contacts a source', 'One private workspace per newsroom, and a morning brief'],
    vision: ['Duplicate stories merged automatically', 'A mobile desk for reporters'],
    howTitle: <>From a tip to a story, <em>with the source sealed.</em></>,
    how: [
      ['Intake', 'Guided chat, widget, email, or SMS. No account.'],
      ['Brief', 'The claim, how to verify it, and the risk to the source.'],
      ['Board', 'Tips on the same story cluster, tiered Hot to Watch.'],
      ['Contact', 'The source says yes or no. No name until yes.'],
    ],
    visual: 'signals',
  },
  {
    slug: 'ballotwatch', name: 'BallotWatch', host: 'ballotwatch.io', url: 'https://www.ballotwatch.io', line: 'How Congress votes, in plain English.',
    theme: { '--c-bg': '#0c1626', '--c-accent': '#c9a85c', '--c-scrim': 'linear-gradient(90deg, rgba(9,18,34,.9) 0%, rgba(9,18,34,.55) 50%, rgba(9,18,34,.75) 100%)' },
    bg: '/work/ballotwatch/hero-capitol.jpg', figure: '/work/ballotwatch/capitol-logo.svg', figureAlt: 'BallotWatch capitol mark', figureClass: 'is-mark',
    kicker: 'How did your representative vote this week?',
    value: <>See how Congress votes. <em>Every fact linked to its official source.</em></>,
    lede: 'Look up your senators and representative, see every vote they cast, and read bills in plain English.',
    visionTitle: <>Every vote, <em>in plain English.</em></>,
    today: ['Find your senators and representative', 'Bills tracked in plain English', 'Every vote on the record, linked to its source', 'This week on the floor', 'Tell your rep, in your own words', 'A public API for developers and researchers'],
    vision: ['Bill alerts by email', 'Tools for congressional offices, in development and not for sale'],
    howTitle: <>What you can do <em>on BallotWatch.</em></>,
    how: [
      ['Know who speaks for you', 'Your address finds your House member and both senators. A ZIP code alone finds your senators.'],
      ['See exactly how they voted', 'Every roll call, this week’s and every one before it, with each yea or nay linked to the official record.'],
      ['Bills in plain English', 'What a bill would actually change and who it affects, with the full text one click away.'],
      ['Any record in 60 seconds', 'One card for every member: votes cast, votes missed, and the latest votes. No scores, no spin.'],
      ['Then write to the person who cast it', 'Your message starts with the facts of the vote. You add your words and send it yourself.'],
    ],
    visual: 'capitol',
  },
  {
    slug: 'spacial', name: 'Spacial Health', host: 'Platform preview', url: null, line: 'Complex care, finally coordinated.',
    theme: { '--c-bg': '#243b73', '--c-accent': '#c9bdff', '--c-scrim': 'linear-gradient(90deg, rgba(36,59,115,.94) 0%, rgba(36,59,115,.84) 55%, rgba(36,59,115,.92) 100%)' },
    bg: '/work/spacial/ink-threads.jpg', figure: 'spacial-mark', figureAlt: 'Spacial Health mark', figureClass: 'is-mark',
    kicker: 'Complex care, finally coordinated',
    value: <>Care that remembers <em>the whole person.</em></>,
    lede: 'Spacial is building one physician-reviewed care journey: every record, specialist, and next step in one place, so patients feel known and care teams see the whole picture. The preview runs on sample data.',
    visionTitle: <>One clinical story, <em>one living plan.</em></>,
    today: ['A platform preview built alongside Dr. Douglas Jones’ allergy and immunology practice', 'One clinical story instead of scattered records', 'One connected care team and one living plan', 'The preview runs on representative sample data only'],
    vision: ['Spacial Clinical Intelligence: AI pulls every record into one picture, and a physician approves it before anything changes'],
    todayLabel: 'In the preview',
    howTitle: <>Tell it once. See it whole. <em>Keep it moving.</em></>,
    how: [
      ['Tell it once', 'The patient shares one guided story and brings the outside record into one secure place.'],
      ['Turn fragments into a whole', 'Records, symptoms, labs, and open evidence gaps become one source-linked picture.'],
      ['Let the physician decide', 'The physician corrects, sequences, and approves the clinical path before it becomes care.'],
      ['Bring the right team together', 'The patient and the right specialists arrive prepared around one shared agenda.'],
      ['Keep the plan alive', 'Tasks, messages, symptoms, and outcomes stay connected long after the visit ends.'],
    ],
    howNote: 'Platform preview. Runs on representative sample data only.',
    visual: 'assemble',
  },
  {
    slug: 'validate', name: 'Validate-s', host: 'validate-s.com', url: 'https://www.validate-s.com', line: 'Is this idea worth building?',
    theme: { '--c-bg': '#14140f', '--c-accent': '#4ade80', '--c-mute': 'rgba(247,246,243,.62)', '--c-scrim': 'radial-gradient(110% 90% at 30% 50%, rgba(74,222,128,.10) 0%, rgba(20,20,15,0) 60%)' },
    bg: null, bgCss: '#14140f', figure: '/work/validate/mark.svg', figureAlt: 'Validate-s mark', figureClass: 'is-mark',
    kicker: 'A public room where AI agents argue about ideas',
    value: <>Post an idea. <em>Agents research it, argue it out, and write the record.</em></>,
    lede: 'Five house agents look for who has already thought of an idea, who is building it, and where it breaks. People and outside agents can join any room.',
    howTitle: <>From an idea <em>to an honest answer.</em></>,
    how: [
      ['Post an idea', 'A person or an AI agent posts it. Each idea gets its own room.'],
      ['Research and argue', 'An Advocate, a Skeptic, a Cartographer, a Customer and a Verifier search the web and argue over three rounds.'],
      ['Score it', 'Every agent scores the idea out of 10 next to its turn. No agent scores a room it opened.'],
      ['Write the record', 'Who has built it, the strongest case for and against, open questions, and the cheapest next experiment.'],
      ['Ask real people', 'Every room ends in a one-page test that says the product does not exist yet and asks visitors if they want it.'],
    ],
  },
]


// Case studies for the /work hub. Problem and built lists restate each product's own live copy; stacks were checked
// against each repo or live bundle on 2026-10-27. `results` stays null until there is a real number or a quote with
// permission, and the page shows a TODO in its place. Never fill it with an estimate.
export const studies = {
  utern: {
    problem: 'Students apply to internships that don’t fit them, and companies can’t see what a student can actually do. UTern needed to match the two on evidence, not scores.',
    built: ['Birdee, an AI that reads live internships every day and brings each student the few that fit', 'A record students build by talking through their projects, jobs and code', 'Side-by-side applications: Birdee drafts, the student edits and submits', 'Blind review for companies: no name or photo until the student says yes'],
    stack: 'Next.js, Supabase, Claude, Stripe',
    status: 'Live at utern.ai. UTern is an independent company.',
    results: null,
  },
  leed: {
    problem: 'Tips reach a newsroom everywhere at once: inboxes, DMs, voicemail. Reporters need to see which tips are about the same story while every source stays protected.',
    built: ['Tip intake by guided chat, widget, email or SMS, with no account and no name', 'An AI brief for every tip: the claim, how to check it, the risk to the source', 'A board that groups tips about the same story', 'Source contact that stays sealed until the source says yes'],
    stack: 'Next.js',
    status: 'Live at leed.media.',
    results: null,
  },
  ballotwatch: {
    problem: 'Congressional votes are public, but they’re scattered and written for insiders. People wanted to see how their own representatives voted, with sources and without spin.',
    built: ['Lookup of your House member and both senators by address', 'Every roll call vote, each linked to the official record', 'Bills summarized in plain English, full text one click away', 'A message tool that starts from the facts of a vote, and a public API'],
    stack: 'React, Vite, Supabase',
    status: 'Live at ballotwatch.io.',
    results: null,
  },
  validate: {
    problem: 'Building is cheap now, so the hard question is whether an idea is worth building at all. Founders needed an honest, sourced answer before spending the time.',
    built: ['Five house agents that research an idea on the web and argue over three rounds', 'A score out of 10 from every agent, shown once three have scored', 'A written record: prior art, the case for and against, the cheapest next experiment', 'A one-page smoke test per idea, and an API and MCP server so outside agents can join'],
    stack: 'React, Supabase, Claude',
    status: 'Live at validate-s.com.',
    results: null,
  },
}

// The four case studies the /work hub, the home tiles and the footer show, in this order. Spacial Health keeps its page but is not listed.
export const workSlugs = ['utern', 'leed', 'ballotwatch', 'validate']

// Published prices, set by Spencer on 2026-10-27. Anything not listed here is priced in a written scope after a call.
export const pricing = {
  launch: { name: 'Launch Site', price: '$12k to $25k', unit: 'one time', scope: 'A marketing site built to rank and to convert: design, build, a CMS you can edit, and SEO set up from day one. Usually 3 to 5 weeks.' },
  care: { name: 'Care', price: '$1,000 to $1,500', unit: 'a month', scope: 'Hosting oversight, updates, uptime checks and small fixes. About 5 hours a month.' },
  growth: { name: 'Growth', price: '$3,000 to $5,000', unit: 'a month', scope: 'Everything in Care, plus new SEO pages, analytics and conversion tests. About 15 hours a month.' },
}

// The short list the home tiles, footer and 404 show
export const built = workSlugs.map(s => companies.find(c => c.slug === s)).map(c => ({ slug: c.slug, name: c.name, host: c.host, url: `/work/${c.slug}`, line: c.line }))

// The recursive agentic systems. Status is what is true today: product fixes run on our own site; the other areas are the roadmap.
export const systems = {
  title: 'Then it keeps getting better.',
  lead: 'We build agentic systems that keep improving a product after launch. Next, they learn to improve themselves.',
  broad: 'Most software starts aging the day it launches. Our systems keep the whole company moving forward: the product, the growth, the content, the support, the operations. Every run is recorded, and the next step is a system that learns from those runs and improves itself.',
  steps: ['Observe', 'Decide', 'Build', 'Verify', 'Learn'],
  areas: [
    ['Product', 'Find what is broken or slow and fix it before customers notice.', true],
    ['Growth', 'Test changes against outcomes that matter. Keep what works.'],
    ['Content', 'Draft posts and updates for a person to approve.'],
    ['Support and operations', 'Handle the repeatable work. Hand the judgment calls to a person.'],
    ['Knowledge', 'Turn calls, notes, and transcripts into ideas worth testing.'],
  ],
  guard: 'People set the goals, the budget, and the limits. Every change is checked in a real browser before it ships.',
  status: 'Running on our own site. On Oct 11 it found a bug, fixed it, and shipped the fix.',
  statusLong: 'Today: product fixes, running on our own site. The rest is what we are building toward.',
}
