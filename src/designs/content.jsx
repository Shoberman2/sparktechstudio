// Shared copy for the design directions and the company pages. Facts come from each company's own repo and live site (checked 2026-10-15).
// Shipped and vision are kept apart on purpose. UTern is an independent company; nothing here asserts SparkTech ownership of any of them.
export const EMAIL = 'contactus@sparktechstudio.com'
export const CALENDLY = 'https://calendly.com/spencerhoberman-utern/30min'
export const year = new Date().getFullYear()

export const companies = [
  {
    slug: 'utern', name: 'UTern', host: 'utern.ai', url: 'https://utern.ai', line: 'Your AI for landing an internship.',
    seo: { title: 'UTern: AI Internship App Case Study | Sparktech Studios', description: 'How Sparktech Studios built UTern, an AI app (Birdee) that matches students with real internships and brings companies students who fit the role.' },
    buildType: 'AI web app',
    // Project facts. TODO(Spencer): role, platform and stack, timeline or launch date, results. Empty fields are not shown.
    facts: { role: '', stack: '', timeline: '', status: 'Live', results: '' },
    tileAlt: 'Birdee, the bird that guides students through UTern',
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
    seo: { title: 'Leed: Newsroom Tip Management App Case Study | Sparktech Studios', description: 'Leed reads, sorts, and secures every tip a newsroom receives. A product built by Sparktech Studios, a New York product studio.' },
    buildType: 'AI web app for newsrooms',
    // Project facts. TODO(Spencer): role, platform and stack, timeline or launch date, results. Empty fields are not shown.
    facts: { role: '', stack: '', timeline: '', status: 'Live', results: '' },
    tileAlt: 'Sherlock, Leed’s desk agent, in a hat and round glasses',
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
    seo: { title: 'BallotWatch: Congressional Vote Tracker Case Study | Sparktech Studios', description: 'BallotWatch shows how Congress votes in plain English, with every fact linked to its official source. Built by Sparktech Studios in NYC.' },
    buildType: 'Web app and public API',
    // Project facts. TODO(Spencer): role, platform and stack, timeline or launch date, results. Empty fields are not shown.
    facts: { role: '', stack: '', timeline: '', status: 'Live', results: '' },
    tileAlt: 'BallotWatch’s Capitol dome mark',
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
    seo: { title: 'Spacial Health: Care Coordination App Case Study | Sparktech Studios', description: 'Spacial Health coordinates complex care around the whole person. A health product designed and built by Sparktech Studios, New York.' },
    buildType: 'Health platform preview',
    // Project facts. TODO(Spencer): role, platform and stack, timeline or launch date, results. Empty fields are not shown.
    facts: { role: '', stack: '', timeline: '', status: 'Platform preview on sample data', results: '' },
    tileAlt: 'Spacial Health’s dot mark',
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
    slug: 'budtender', name: 'Budtender', host: 'Private preview', url: null, line: 'Know what you like. Remember why.',
    seo: { title: 'Budtender with High Times: Cannabis App Case Study | Sparktech Studios', description: 'Budtender, built with High Times: rank what you try, see what friends love, and ask Budzy what’s next. Designed and built by Sparktech Studios, NYC.' },
    buildType: 'AI consumer app',
    // Project facts. TODO(Spencer): role, platform and stack, timeline or launch date, results. Empty fields are not shown.
    facts: { role: '', stack: '', timeline: '', status: 'Private preview', results: '' },
    tileAlt: 'Budzy, Budtender’s AI, on a phone screen',
    // TODO(Spencer): a quote or partnership details from High Times, and brand-approved logo usage if wanted
    partner: { name: 'High Times', url: 'https://hightimes.com', body: 'Sparktech Studios designed and built Budtender in partnership with High Times.' },
    tileLine: 'Know what you like. Remember why. Built with High Times.',
    theme: { '--c-bg': '#0f2a1d', '--c-accent': '#f28322', '--c-mute': 'rgba(236,244,238,.66)', '--c-scrim': 'radial-gradient(120% 90% at 25% 50%, rgba(66,140,96,.0) 0%, rgba(10,32,21,.35) 60%, rgba(8,26,17,.85) 100%)' },
    bg: null, bgCss: 'radial-gradient(90% 80% at 28% 52%, #4f9e6f 0%, #2a6b47 38%, #143b27 72%, #0b2418 100%)', figure: '/work/budtender/budzy-phone.webp', figureAlt: 'Budzy on a phone', figureClass: 'is-phone',
    kicker: 'Meet Budzy. He remembers.',
    value: <>Know what you like. <em>Remember why.</em></>,
    lede: 'Rank what you try. See what your friends love. Ask Budzy what’s next. He only reads the history you let him.',
    visionTitle: <>Find the strains <em>you love.</em></>,
    today: ['Log what you tried and how it felt', 'Your own rankings and lists', 'A page for every strain', 'Budzy, a personal AI that reads only the history you allow', 'Verified pages for dispensaries, growers, and labs'],
    todayLabel: 'Built so far',
    vision: ['Opt-in dispensary purchases, so your shelf fills itself. Planned, not live'],
    howTitle: <>Every strain you try, <em>remembered.</em></>,
    how: [
      ['Every strain is a card', 'Look up any strain and see what’s in it: THC, CBD and terpenes from public state lab tests.'],
      ['Three taps after a session', 'Say how it was: loved, fine or not for you. Then a few quick head-to-heads against strains you’ve already ranked.'],
      ['Your list sorts itself', 'Every pick moves the strain into its place, and its place sets a 0 to 10 score. Your order is your opinion.'],
      ['Share with the people you pick', 'Keep a log to yourself, send it to friends, or share a circle: a private list your friends can add to.'],
      ['Budzy knows your list', 'Ask what to try next or what your favorites have in common. He answers from your lists, never the open internet.'],
    ],
    howNote: 'Private preview.',
    visual: 'phone', note: 'Budtender is in private preview.',
  },
]

// The short list the three design directions show
export const built = companies.map(c => ({ slug: c.slug, name: c.name, host: c.host, url: `/work/${c.slug}`, line: c.line, tileLine: c.tileLine || c.line, tileAlt: c.tileAlt || '' }))

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
