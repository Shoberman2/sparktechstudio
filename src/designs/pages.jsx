// Copy for the service, industry and location pages (the 2026-10-27 rebuild plan, .rebuild-plan.md).
// URLs and keywords come from the plan's SEO table. Every service page names two case studies from content.jsx.
// No clients, testimonials or numbers are invented here. Pages that still need proof we don't have yet are noindex.

import { serviceList } from '../site/facts.js'

// How every project runs, from the 2026-10-15 offer pass. Terms beyond this are set in the written scope.
export const process = [
  ['Call', 'We talk through what you want built and who it’s for.'],
  ['Written scope', 'What we build, what it costs, and when.'],
  ['Build and launch', 'Designed, built, tested in a real browser, shipped.'],
  ['Keep improving', 'Optional monthly updates after launch.'],
]

const line = slug => serviceList.find(x => x.slug === slug)
export const services = [
  {
    ...line('ai-app-development'),
    title: 'AI App Development Agency | SparkTech Studios',
    description: 'AI app development. We design and build AI web apps and AI MVPs that people use every day, from the first call to launch.',
    name: 'AI app development',
    h1: 'AI Apps That Do Real Work',
    lede: 'Web apps where the AI is the product, not a chat box bolted on. It reads, sorts, drafts and decides alongside the people using it, and it shows its sources.',
    points: [
      ['AI people trust', 'Every answer traces back to what it was built from. People approve the steps that matter.'],
      ['The model that fits', 'We can switch the AI model later without starting over.'],
      ['A real product around it', 'Accounts, data, payments and an interface that makes sense on day one.'],
    ],
    cases: ['utern', 'validate'],
  },
  {
    ...line('ai-agents'),
    title: 'AI Agent Development for Businesses | SparkTech Studios',
    description: 'AI agents for businesses. We set up AI agents that answer customers, sort requests and follow up, inside the tools you already use.',
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
    ...line('seo-aeo'),
    title: 'SEO and AEO Services | SparkTech Studios',
    description: 'SEO and AEO for businesses. We help your site show up on Google and get named in AI answers like ChatGPT and Perplexity. Book a call.',
    name: 'SEO and AEO',
    h1: 'Get Found On Google And In AI Answers',
    // What it is, in plain lines. No price is published for this service, and no rankings are promised.
    lede: 'SEO gets your site found on Google. AEO gets your business named when people ask AI tools like ChatGPT and Perplexity. Both start with a site that says clearly what you do.',
    points: [
      ['Fix the basics', 'Fast pages, clear titles and a sitemap Google can read.'],
      ['Answer real questions', 'Pages that answer what your customers ask, in plain words.'],
      ['Make it easy to cite', 'Clear facts about your business that AI tools can quote and link to.'],
    ],
    bandTitle: 'Want People To Find You?',
    cases: [],
  },
  {
    ...line('web-app-development'),
    title: 'Custom Web App Development | SparkTech Studios',
    description: 'Custom web app development. We build fast, maintainable web apps on Next.js and React, with real accounts, data and payments.',
    name: 'Web app development',
    h1: 'Custom Web Apps Built To Last',
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
    title: 'Web Design for Small Businesses | SparkTech Studios',
    description: 'Website design and development for small businesses. We build it, maintain it and make your updates. Live in days.',
    name: 'Website design and development',
    h1: 'A Website That Looks Like You Mean It',
    lede: 'Your site is the first meeting most people have with you. We design and build sites that load fast, read clearly, and turn a visit into a call.',
    points: [
      ['Designed, not templated', 'Type, layout and motion made for your company, built by the people who designed it.'],
      ['Found in search', 'Clear page titles and a sitemap, set up before launch.'],
      ['Yours to edit', 'A CMS for the pages you change often, so updates don’t wait on us.'],
    ],
    cases: ['ballotwatch', 'utern'],
  },
  {
    ...line('startup-mvp'),
    title: 'MVP Development Company | SparkTech Studios',
    description: 'MVP development for startups. We build the smallest version of your product that real people can use, then help you learn from it.',
    name: 'MVPs for startups',
    h1: 'Your First Version In Real Hands',
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
    title: 'Website Maintenance and Updates | SparkTech Studios',
    description: 'Website maintenance and updates for small businesses. We fix what breaks, make your edits and keep your site current, in one monthly price.',
    name: 'Maintenance and growth retainers',
    h1: 'Launch Is Day One',
    lede: 'Sites start aging the day they ship. One monthly price keeps yours current, fixed and getting better.',
    // 2026-11-24 (SEO pass): the page was 106 words with no list. Each line restates what the membership already
    // promises elsewhere (home reel, Whop listing, serviceList): fixes, updates, new pages and features, search.
    points: [
      ['Fixes', 'If something on your site breaks, we fix it.'],
      ['Your updates', 'Send the change you want, like new text, photos, prices or a new page, and we make it.'],
      ['New features', 'Ask for something new and we build it.'],
      ['Found in search', 'We keep your titles, sitemap and business facts current for Google and AI answers.'],
    ],
    cases: ['utern', 'ballotwatch'],
  },
]

// How every project runs, as shown on each service page (2026-11-24). Same facts as the home FAQ and the Whop listing;
// maintenance and updates are part of the one monthly price, so the old "optional monthly updates" step is gone here.
export const steps = [
  ['Book a call', 'Tell us what you want built and who it’s for.'],
  ['Written scope', 'What we build, what it costs and when.'],
  ['Build and launch', 'Designed, built, tested in a real browser, shipped.'],
  ['Maintain and update', 'Fixes and your updates continue in the same monthly price.'],
]

// A short FAQ per service page: cost, timeline, stack and code ownership. Prices come from `pricing`, stacks from the
// case studies the page already names. Ownership and anything not published stay with the written scope (2026-10-15 offer pass).
const scoped = 'It’s dated in the written scope after the call, because the timeline depends on what we’re building.'
const ownership = ['Who owns the code?', 'Ownership, access and support are spelled out in the written scope, before any work starts.']
const faqs = {
  'ai-app-development': [
    ['What does an AI app cost?', 'A flat $500 a month per business, no matter what you need.'],
    ['How long does it take?', scoped],
    ['What do you build it on?', `We pick the AI model that fits the job, and we can switch it later without starting over.`],
    ownership,
  ],
  'ai-agents': [
    ['What does an AI agent cost?', 'A flat $500 a month per business, no matter what you need.'],
    ['How long does it take?', scoped],
    ['What do you build it on?', `The AI model that fits the job, connected to the tools you already use.`],
    ownership,
  ],
  'web-app-development': [
    ['What does a web app cost?', 'A flat $500 a month per business, no matter what you need.'],
    ['How long does it take?', scoped],
    ['What do you build it on?', `Next.js and React, a stack your next hire already knows.`],
    ownership,
  ],
  'web-design': [
    ['What does a website cost?', 'A flat $500 a month. That covers the build, maintenance and your updates, with no build fee.'],
    ['How long does it take?', 'Days, not months. The dates go in the written scope.'],
    ['What do you build it on?', 'A stack named in the written scope, with a CMS for the pages you change often.'],
    ownership,
  ],
  'startup-mvp': [
    ['What does an MVP cost?', 'A flat $500 a month per business, no matter what you need.'],
    ['How long does it take?', scoped],
    ['What do you build it on?', `Real code on a real stack, so version two builds on version one.`],
    ownership,
  ],
  retainers: [
    ['What does it cost?', 'It’s part of the same flat $500 a month: maintenance and your updates included.'],
    ['What stack do you work on?', `The sites and apps we build. Anything else is settled in the written scope.`],
    ownership,
  ],
}
// SEO and AEO questions (2026-11-21): plain answers, no promised rankings. Price is the flat $500 a month (PR #5).
faqs['seo-aeo'] = [
  ['What is AEO?', 'Answer engine optimization. It helps AI tools like ChatGPT, Perplexity and Google’s AI answers find your business and name it when people ask.'],
  ['How is it different from SEO?', 'SEO helps you rank in Google’s results. AEO helps you get named inside AI answers. Both start with a fast site that says clearly what you do.'],
  ['Do you promise first place on Google?', 'No one honest can. We fix what holds a site back, write pages that answer real questions and make your facts easy to cite.'],
  ['What does it cost?', 'A flat $500 a month per business, no matter what you need.'],
  ['Can I check my site first?', 'Yes. Our free checker scores your site out of 100 and lists what to fix first, at sparktechstudio.com/grader.'],
]
for (const s of services) s.faq = faqs[s.slug]

export const industry = {
  slug: 'professional-services', path: '/industries/professional-services',
  title: 'Law, Finance and Medical Websites | SparkTech Studios',
  description: 'Websites for law firms, financial advisors and medical practices. Built, maintained and updated.',
  name: 'Law, finance and medical sites',
  h1: 'Websites For Firms People Trust',
  lede: 'Law firms, financial advisors and medical practices sell trust before anything else. We build sites that look the part, explain what you do in plain English, and make the first call easy.',
  points: [
    ['Law firms', 'Practice areas and attorney pages that read clearly, and intake that asks only what it needs to.'],
    ['Financial advisors', 'Who you serve, how you’re paid, and how to start, said plainly.'],
    ['Medical practices', 'Services, locations and booking that patients can find on a phone, in a hurry.'],
  ],
  note: 'Your compliance team or counsel signs off on the copy. We build in room for the disclaimers and disclosures your bar, regulator or practice requires.',
  cases: ['leed', 'ballotwatch'],
  caseNote: 'Not law or finance sites, but the same job: sensitive information handled with care, and every fact traceable to its source.',
  // No professional-services case study yet: noindex until a real law, finance or medical client can be named (TODOS.md)
  noindex: true,
}

// Location pages. Each needs real local proof (a client, a partner, an office) before it is promoted.
// We have none we can publish yet, so each carries a TODO and stays out of the index until it is filled.
const loc = (slug, place, title, keywords, intro, near) => ({
  slug, path: `/locations/${slug}`, place, near,
  title: `${title} | SparkTech Studios`,
  description: `${keywords}. SparkTech Studios is an independent web and AI app studio in New York. Book a call.`,
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
  loc('suffolk-county', 'Suffolk County', 'Suffolk County Web Design & Development', 'Web design in Suffolk County',
    'Websites and web apps for businesses in Suffolk County, from Huntington east.', ['long-island', 'nassau-county']),
]

// /pricing: the three published packages in one place. The numbers are from the rebuild plan and still need Spencer's
// sign-off, so the page carries a TODO and stays noindex (and out of the nav and sitemap) until he confirms them.
export const pricingPage = {
  path: '/pricing',
  title: 'Pricing | SparkTech Studios',
  description: 'SparkTech services are a flat $500 a month per business, no matter what.',
  // Final numbers pending Spencer's confirmation, so the page stays noindex
  noindex: true,
}

// /partners: for design studios, agencies and accelerators that want a build partner. Terms are set per partner in a
// written scope, so the page names none (no rev share, no discounts, no partner logos).
export const partnersPage = {
  path: '/partners',
  title: 'Build Partner for Studios and Agencies | SparkTech Studios',
  description: 'A build partner for design studios, agencies and accelerators. You bring the client or the cohort; we build the AI app, MVP or website. Book a call.',
  h1: 'Your Clients. Our Build.',
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
    ['Keep improving', 'Optional monthly updates keep it fixed and improving.'],
  ],
}

// Every page this module adds, for the router and the prerender
// The home page's search title (2026-11-24). It used to be the bare brand, which told Google nothing about what we do.
// Used by the prerender (the <title> crawlers read) and by Home.jsx (the tab title after the page loads).
export const homeMeta = {
  title: 'SparkTech Studios | Small Business Websites, $500 a Month',
  description: 'We design, build and run small business websites for $500 a month and get them found on Google and in AI answers like ChatGPT.',
}

export const pageRoutes = [
  ...services.map(s => ({ path: s.path, title: s.title, description: s.description })),
  { path: partnersPage.path, title: partnersPage.title, description: partnersPage.description },
]
