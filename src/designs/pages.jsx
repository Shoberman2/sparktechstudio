// Copy for the service, industry and location pages (the 2026-10-27 rebuild plan, .rebuild-plan.md).
// URLs and keywords come from the plan's SEO table. Every service page names two case studies from content.jsx.
// No clients, testimonials or numbers are invented here. Pages that still need proof we don't have yet are noindex.

import { companies, studies, pricing } from './content.jsx'
import { serviceList } from '../site/facts.js'

// How every project runs, from the 2026-10-15 offer pass. Terms beyond this are set in the written scope.
export const process = [
  ['Call', 'We talk through what you want built and who it’s for.'],
  ['Written scope', 'What we build, what it costs, and when.'],
  ['Build and launch', 'Designed, built, tested in a real browser, shipped.'],
  ['Keep improving', 'An optional Care or Growth retainer after launch.'],
]

const line = slug => serviceList.find(x => x.slug === slug)
export const services = [
  {
    ...line('ai-app-development'),
    title: 'AI App Development Agency in New York | SparkTech Studio',
    description: 'AI app development in New York. We design and build AI web apps and AI MVPs that people use every day, from the first call to launch.',
    name: 'AI app development',
    h1: 'AI Apps That Do Real Work',
    lede: 'Web apps where the AI is the product, not a chat box bolted on. It reads, sorts, drafts and decides alongside the people using it, and it shows its sources.',
    points: [
      ['AI people trust', 'Every answer traces back to what it was built from. People approve the steps that matter.'],
      ['The model that fits', 'Prompts and evaluations live in the codebase, so the model can change without a rewrite.'],
      ['A real product around it', 'Accounts, data, payments and an interface that makes sense on day one.'],
    ],
    cases: ['utern', 'validate'],
  },
  {
    ...line('ai-agents'),
    title: 'AI Agent Development in New York | SparkTech Studio',
    description: 'AI agents for businesses in New York. We set up AI agents that answer customers, sort requests and follow up, inside the tools you already use.',
    name: 'AI agents',
    h1: 'AI Agents That Do Real Work',
    lede: 'We set up AI agents that take busywork off your team.',
    points: [
      ['Answer', 'Reply to customer questions any time of day.'],
      ['Sort', 'Read new emails and forms, then send each one to the right person.'],
      ['Follow up', 'Chase leads and reminders so nothing slips.'],
    ],
    how: 'We start with one job, connect the agent to the tools you already use, and you approve anything that matters.',
    cases: ['validate', 'leed'],
  },
  {
    ...line('web-app-development'),
    title: 'Custom Web App Development in New York | SparkTech Studio',
    description: 'Custom web app development in New York. We build fast, maintainable web apps on Next.js and React, with real accounts, data and payments.',
    name: 'Web app development',
    h1: 'Custom Web Apps, Built To Last',
    lede: 'Dashboards, portals, marketplaces and internal tools that stay fast when the traffic shows up.',
    points: [
      ['Next.js and React', 'A stack your next hire already knows, so the code doesn’t trap you with us.'],
      ['The hard parts done properly', 'Sign-in, permissions, data, payments and email, set up once and set up right.'],
      ['Checked in a real browser', 'Every release is clicked through before it ships, not just compiled.'],
    ],
    cases: ['leed', 'ballotwatch'],
  },
  {
    ...line('web-design'),
    title: 'Web Design Agency in New York City | SparkTech Studio',
    description: 'Premium website design and development in New York. A Launch Site package from $12k to $25k: design, build, CMS and SEO, usually in 3 to 5 weeks.',
    name: 'Website design and development',
    h1: 'A Website That Looks Like You Mean It',
    lede: 'Your site is the first meeting most people have with you. We design and build sites that load fast, read clearly, and turn a visit into a call.',
    points: [
      ['Designed, not templated', 'Type, layout and motion made for your company, built by the people who designed it.'],
      ['Found in search', 'Clean markup, real page titles, structured data and a sitemap, set up before launch.'],
      ['Yours to edit', 'A CMS for the pages you change often, so updates don’t wait on us.'],
    ],
    package: 'launch',
    cases: ['ballotwatch', 'utern'],
  },
  {
    ...line('startup-mvp'),
    title: 'MVP Development Company in NYC | SparkTech Studio',
    description: 'MVP development for startups in New York. We build the smallest version of your product that real people can use, then help you learn from it.',
    name: 'MVPs for startups',
    h1: 'The First Version, In Real Hands',
    lede: 'An MVP is the smallest thing that tells you whether you’re right. We help you pick what to leave out, build the rest properly, and put it in front of real people.',
    points: [
      ['Scope that fits the question', 'Start from what you need to learn, then cut everything that doesn’t help you learn it.'],
      ['Built to keep', 'Real code on a real stack, so version two builds on version one.'],
      ['Measured from launch', 'You see who signs up, what they use and where they drop off.'],
    ],
    cases: ['validate', 'leed'],
  },
  {
    ...line('retainers'),
    title: 'Website Maintenance and SEO in NYC | SparkTech Studio',
    description: 'Website updates, maintenance and SEO in New York. Updates $500 a month. Care from $1,000 to $1,500 a month. Growth from $3,000 to $5,000 a month.',
    name: 'Maintenance and growth retainers',
    h1: 'Launch Is Day One',
    lede: 'Sites and apps start aging the day they ship. A retainer keeps yours fast, fixed and getting better, with a set number of hours each month.',
    points: null,
    package: ['updates', 'care', 'growth'],
    cases: ['utern', 'ballotwatch'],
  },
]

// A short FAQ per service page: cost, timeline, stack and code ownership. Prices come from `pricing`, stacks from the
// case studies the page already names. Ownership and anything not published stay with the written scope (2026-10-15 offer pass).
const scoped = 'It’s dated in the written scope after the call, because the timeline depends on what we’re building.'
const ownership = ['Who owns the code?', 'Ownership, access and support are spelled out in the written scope, before any work starts.']
const ran = slugs => slugs.map(s => `${companies.find(c => c.slug === s).name} runs on ${studies[s].stack}.`).join(' ')
const price = k => `${pricing[k].name} is ${pricing[k].price} ${pricing[k].unit}`
const faqs = {
  'ai-app-development': [
    ['What does an AI app cost?', 'AI apps are priced in a written scope after a call, because no two are the same size.'],
    ['How long does it take?', scoped],
    ['What do you build it on?', `We pick the model that fits the job and keep prompts and evaluations in the codebase, so the model can change without a rewrite. ${ran(['utern', 'validate'])}`],
    ownership,
  ],
  'ai-agents': [
    ['What does an AI agent cost?', 'AI agents are priced after a call, because each one is set up for a different business.'],
    ['How long does it take?', scoped],
    ['What do you build it on?', `The model that fits each job, with the agent’s tools, limits and logs kept in your codebase. ${ran(['validate'])}`],
    ownership,
  ],
  'web-app-development': [
    ['What does a web app cost?', 'Web apps are priced in a written scope after a call.'],
    ['How long does it take?', scoped],
    ['What do you build it on?', `Next.js and React, a stack your next hire already knows. ${ran(['leed', 'ballotwatch'])}`],
    ownership,
  ],
  'web-design': [
    ['What does a website cost?', `The ${pricing.launch.name} package is ${pricing.launch.price}: design, build, a CMS you can edit, and SEO set up from day one.`],
    ['How long does it take?', 'Usually 3 to 5 weeks. The dates go in the written scope.'],
    ['What do you build it on?', 'A stack named in the written scope, with a CMS for the pages you change often.'],
    ownership,
  ],
  'startup-mvp': [
    ['What does an MVP cost?', 'MVPs are priced in a written scope after a call.'],
    ['How long does it take?', scoped],
    ['What do you build it on?', `Real code on a real stack, so version two builds on version one. ${ran(['validate', 'leed'])}`],
    ownership,
  ],
  retainers: [
    ['What does a retainer cost?', `${price('updates')}. ${price('care')}. ${price('growth')}.`],
    ['What stack do you work on?', `The sites and apps we build. ${ran(['utern', 'ballotwatch'])} Anything else is settled in the written scope.`],
    ownership,
  ],
}
for (const s of services) s.faq = faqs[s.slug]

export const industry = {
  slug: 'professional-services', path: '/industries/professional-services',
  title: 'Law, Finance and Medical Websites in NYC | SparkTech Studio',
  description: 'Websites for law firms, financial advisors and medical practices in New York City and Long Island. Launch Site package from $12k to $25k.',
  name: 'Law, finance and medical sites',
  h1: 'Websites For Firms People Trust',
  lede: 'Law firms, financial advisors and medical practices sell trust before anything else. We build sites that look the part, explain what you do in plain English, and make the first call easy.',
  points: [
    ['Law firms', 'Practice areas and attorney pages that read clearly, and intake that asks only what it needs to.'],
    ['Financial advisors', 'Who you serve, how you’re paid, and how to start, said plainly.'],
    ['Medical practices', 'Services, locations and booking that patients can find on a phone, in a hurry.'],
  ],
  note: 'Your compliance team or counsel signs off on the copy. We build in room for the disclaimers and disclosures your bar, regulator or practice requires.',
  package: 'launch',
  cases: ['leed', 'ballotwatch'],
  caseNote: 'Not law or finance sites, but the same job: sensitive information handled with care, and every fact traceable to its source.',
  // No professional-services case study yet: noindex until a real law, finance or medical client can be named (TODOS.md)
  noindex: true,
}

// Location pages. Each needs real local proof (a client, a partner, an office) before it is promoted.
// We have none we can publish yet, so each carries a TODO and stays out of the index until it is filled.
const loc = (slug, place, title, keywords, intro, near) => ({
  slug, path: `/locations/${slug}`, place, near,
  title: `${title} | SparkTech Studio`,
  description: `${keywords}. SparkTech Studio is an independent web and AI app studio in New York. Book a call.`,
  h1: `Web And AI Apps For ${place}`,
  lede: intro,
  cases: ['utern', 'ballotwatch'],
})

export const locations = [
  loc('new-york-city', 'New York City', 'Web Development Agency in New York City', 'Web development agency in New York City',
    'We’re a New York studio. We build AI web apps, MVPs and websites for companies across the five boroughs.', ['manhattan', 'brooklyn']),
  loc('manhattan', 'Manhattan', 'Manhattan Web Development Company', 'Manhattan web development company',
    'Websites and web apps for Manhattan companies and firms, from a studio in New York.', ['new-york-city', 'brooklyn']),
  loc('brooklyn', 'Brooklyn', 'Brooklyn Web Design and App Development', 'Web design and app development in Brooklyn',
    'Websites and apps for Brooklyn companies, studios and startups, from a studio in New York.', ['new-york-city', 'manhattan']),
  loc('long-island', 'Long Island', 'Long Island Web and App Development', 'Web design and app development on Long Island',
    'Websites and web apps for Long Island businesses in Nassau and Suffolk, from a studio in New York.', ['nassau-county', 'suffolk-county']),
  loc('nassau-county', 'Nassau County', 'Nassau County Web Design and Development', 'Web design in Nassau County',
    'Websites and web apps for businesses in Nassau County, from Garden City to the North Shore.', ['long-island', 'suffolk-county']),
  loc('suffolk-county', 'Suffolk County', 'Suffolk County Web Design and Development', 'Web design in Suffolk County',
    'Websites and web apps for businesses in Suffolk County, from Huntington east.', ['long-island', 'nassau-county']),
]

// /pricing: the three published packages in one place. The numbers are from the rebuild plan and still need Spencer's
// sign-off, so the page carries a TODO and stays noindex (and out of the nav and sitemap) until he confirms them.
export const pricingPage = {
  path: '/pricing',
  title: 'Pricing | SparkTech Studio',
  description: 'Launch Site from $12k to $25k. Website updates $500 a month. Care from $1,000 to $1,500 a month. Growth from $3,000 to $5,000 a month. Everything else is priced in a written scope.',
  // How the retainers read on this page: Care is maintenance, Growth is SEO and AI features
  scopes: {
    care: 'Maintenance. Hosting oversight, updates, uptime checks and small fixes, so the site stays fast and keeps working. About 5 hours a month.',
    growth: 'SEO and AI features. Everything in Care, plus new SEO pages and new AI features, each one checked against what it was meant to move. About 15 hours a month.',
  },
  // Final numbers pending Spencer's confirmation, so the page stays noindex
  noindex: true,
}

// /partners: for design studios, agencies and accelerators that want a build partner. Terms are set per partner in a
// written scope, so the page names none (no rev share, no discounts, no partner logos).
export const partnersPage = {
  path: '/partners',
  title: 'Build Partner for Studios and Agencies | SparkTech Studio',
  description: 'A build partner for design studios, agencies and accelerators. You bring the client or the cohort; we build the AI app, MVP or website. Book a call.',
  h1: 'Your Clients, Our Build',
  lede: 'For design studios, agencies and accelerators that need someone to build what they’ve designed or promised. You keep the relationship. We build it and keep it standing.',
  who: [
    ['Design studios', 'You made the brand and the screens. We build them as a real site or app, close to the pixel, so the work you sold is the work that ships.'],
    ['Agencies', 'When a client asks for an AI feature, a web app or a site your team can’t take on, we build it alongside you.'],
    ['Accelerators', 'Founders in your program need a first version people can use. We build MVPs and AI apps on a real stack they can keep.'],
  ],
  how: [
    ['Call', 'The work, the client, and how you want to run it.'],
    ['Written scope', 'Cost, dates, credit, ownership and who talks to the client.'],
    ['Build and launch', 'You see the work as it happens.'],
    ['Keep improving', 'An optional Care or Growth retainer keeps it fixed and improving.'],
  ],
}

// Every page this module adds, for the router and the prerender
export const pageRoutes = [
  ...services.map(s => ({ path: s.path, title: s.title, description: s.description })),
  // noindex while the page still shows a TODO box instead of a real professional-services case study
  { path: industry.path, title: industry.title, description: industry.description, noindex: industry.noindex },
  ...locations.map(l => ({ path: l.path, title: l.title, description: l.description, noindex: true })),
  { path: pricingPage.path, title: pricingPage.title, description: pricingPage.description, noindex: pricingPage.noindex },
  { path: partnersPage.path, title: partnersPage.title, description: partnersPage.description },
]
