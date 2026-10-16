// Shared copy for the design directions and the company pages. Facts come from each company's own repo and live site (checked 2026-10-15).
// Shipped and vision are kept apart on purpose. UTern is an independent company; nothing here asserts SparkTech ownership of any of them.
export const EMAIL = 'contactus@sparktechstudio.com'
export const year = new Date().getFullYear()

export const companies = [
  {
    slug: 'utern', name: 'UTern', host: 'utern.ai', url: 'https://utern.ai', line: 'Your AI for landing an internship.',
    theme: { '--c-bg': '#0d1420', '--c-accent': '#f0a24a', '--c-scrim': 'linear-gradient(90deg, rgba(8,14,24,.1) 0%, rgba(8,14,24,.35) 40%, rgba(8,14,24,.82) 75%, rgba(8,14,24,.88) 100%)' },
    bg: '/work/utern/mountain.webp', bgMobile: '/work/utern/mountain-mobile.webp', figure: '/work/utern/birdee.png', figureAlt: 'Birdee, UTern’s AI',
    kicker: 'Your AI for landing an internship',
    value: <>From enrollment <em>to employment.</em></>,
    lede: 'Birdee, UTern’s AI, finds students real internships that fit and brings companies the students who fit their role. Companies see evidence, never scores.',
    visionTitle: <>The climb, <em>start to summit.</em></>,
    today: ['Only the internships that fit you', 'Everything you do becomes a skill', 'Prove it in a conversation with Birdee', 'Apply with Birdee, side by side', 'Just graduated? Full-time roles too', 'Companies come to you. You say yes before they see you'],
    vision: ['Classes, handled', 'Paid projects, for credit', 'Applications, sent for you', 'Hire from real work, any role', 'One view for the career office', 'Your transcript, read'],
    visual: 'climb', note: 'UTern is an independent company. Coming items are the vision, not shipped features.',
  },
  {
    slug: 'leed', name: 'LEED', host: 'leed.media', url: 'https://www.leed.media', line: 'Every tip, read and kept safe.',
    theme: { '--c-bg': '#0b0b09', '--c-accent': '#e9e4d6', '--c-mute': 'rgba(240,236,226,.6)' },
    bg: '/work/leed/newsrooms.webp', figure: '/work/leed/sherlock.svg', figureAlt: 'Sherlock, LEED’s desk agent', figureClass: 'is-sherlock',
    kicker: 'A private story-intelligence desk for newsrooms',
    value: <>Every tip your newsroom gets, <em>read, sorted, and kept safe.</em></>,
    lede: 'Tips land everywhere: inboxes, DMs, voicemail. LEED pulls them into one private desk, groups the ones about the same story, and keeps every source sealed until they say yes.',
    visionTitle: <>Scattered tips. <em>One private desk.</em></>,
    today: ['Sources send tips through a guided chat. No account, no name', 'AI turns every tip into a brief: the claim, how to check it, the risk to the source', 'Tips about the same story get grouped, so you see the pattern first', 'Reporters can ask to talk. The source says yes or no, and their name stays sealed until yes', 'Sherlock, the AI desk agent, ranks what moved overnight. It never contacts a source', 'One private workspace per newsroom, and a morning brief'],
    vision: ['Duplicate stories merged automatically', 'A mobile desk for reporters'],
    visual: 'signals',
  },
  {
    slug: 'ballotwatch', name: 'Ballot Watch', host: 'ballotwatch.io', url: 'https://www.ballotwatch.io', line: 'How Congress votes, in plain English.',
    theme: { '--c-bg': '#0c1626', '--c-accent': '#c9a85c', '--c-scrim': 'linear-gradient(90deg, rgba(9,18,34,.9) 0%, rgba(9,18,34,.55) 50%, rgba(9,18,34,.75) 100%)' },
    bg: '/work/ballotwatch/hero-capitol.jpg', figure: '/work/ballotwatch/capitol-logo.svg', figureAlt: 'Ballot Watch capitol mark', figureClass: 'is-mark',
    kicker: 'How did your representative vote this week?',
    value: <>See how Congress votes. <em>Every fact linked to its official source.</em></>,
    lede: 'Look up your senators and representative, see every vote they cast, and read bills in plain English.',
    visionTitle: <>Every vote, <em>in plain English.</em></>,
    today: ['Find your senators and representative', 'Bills tracked in plain English', 'Every vote on the record, linked to its source', 'This week on the floor', 'Tell your rep, in your own words', 'A public API for developers and researchers'],
    vision: ['Bill alerts by email', 'Tools for congressional offices, in development and not for sale'],
    visual: 'capitol',
  },
  {
    slug: 'spacial', name: 'Spacial Health', host: 'Platform preview', url: null, line: 'Complex care, finally coordinated.',
    theme: { '--c-bg': '#243b73', '--c-accent': '#c9bdff', '--c-scrim': 'linear-gradient(90deg, rgba(36,59,115,.94) 0%, rgba(36,59,115,.84) 55%, rgba(36,59,115,.92) 100%)' },
    bg: '/work/spacial/ink-threads.jpg', figure: 'spacial-mark', figureAlt: 'Spacial Health mark', figureClass: 'is-mark',
    kicker: 'Complex care, finally coordinated',
    value: <>Care that remembers <em>the whole person.</em></>,
    lede: 'Spacial is building one physician-reviewed care journey: every record, specialist, and next step in one place, so patients feel known and care teams see the whole picture. The preview runs on sample data.',
    visionTitle: <>Tell it once. See it whole. <em>Keep it moving.</em></>,
    today: ['A platform preview built alongside Dr. Douglas Jones’ allergy and immunology practice', 'One clinical story instead of scattered records', 'One connected care team and one living plan', 'The preview runs on representative sample data only'],
    vision: ['Spacial Clinical Intelligence: AI pulls every record into one picture, and a physician approves it before anything changes'],
    todayLabel: 'In the preview',
    visual: 'assemble',
  },
  {
    slug: 'budtender', name: 'Budtender', host: 'Private preview', url: null, line: 'Know what you like. Remember why.',
    theme: { '--c-bg': '#0f2a1d', '--c-accent': '#f28322', '--c-mute': 'rgba(236,244,238,.66)', '--c-scrim': 'radial-gradient(120% 90% at 25% 50%, rgba(66,140,96,.0) 0%, rgba(10,32,21,.35) 60%, rgba(8,26,17,.85) 100%)' },
    bg: null, bgCss: 'radial-gradient(90% 80% at 28% 52%, #4f9e6f 0%, #2a6b47 38%, #143b27 72%, #0b2418 100%)', figure: '/work/budtender/budzy-phone.webp', figureAlt: 'Budzy on a phone', figureClass: 'is-phone',
    kicker: 'Meet Budzy. He remembers.',
    value: <>Know what you like. <em>Remember why.</em></>,
    lede: 'Rank what you try. See what your friends love. Ask Budzy what’s next. He only reads the history you let him.',
    visionTitle: <>Find the strains <em>you love.</em></>,
    today: ['Log what you tried and how it felt', 'Your own rankings and lists', 'A page for every strain', 'Budzy, a personal AI that reads only the history you allow', 'Verified pages for dispensaries, growers, and labs'],
    todayLabel: 'Built so far',
    vision: ['Opt-in dispensary purchases, so your shelf fills itself. Planned, not live'],
    visual: 'phone', note: 'Budtender is in private preview.',
  },
]

// The short list the three design directions show
export const built = companies.map(c => ({ slug: c.slug, name: c.name, host: c.host, url: `/work/${c.slug}`, line: c.line }))

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
