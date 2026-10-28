// Copy for the service, industry and location pages (the 2026-10-27 rebuild plan, .rebuild-plan.md).
// URLs and keywords come from the plan's SEO table. Every service page names two case studies from content.jsx.
// No clients, testimonials or numbers are invented here. Where a page needs proof we don't have yet, `todo`
// holds a note that renders as a visible TODO box, and the prerender marks that page noindex until it is filled.

// How every project runs, from the 2026-10-15 offer pass. Terms beyond this are set in the written scope.
export const process = [
  ['A call', 'We talk through what you want built and who it’s for. A real conversation, not a pitch.'],
  ['A written scope', 'What we’ll build, what it costs, and when. Ownership, access and support are spelled out here.'],
  ['Build and launch', 'We design, build, test in a real browser, and ship.'],
  ['After launch', 'Optional. A Care or Growth retainer keeps it fast, fixed and improving.'],
]

export const services = [
  {
    slug: 'ai-app-development', path: '/services/ai-app-development', nav: 'AI app development',
    title: 'AI App Development Agency in New York | SparkTech Studio',
    description: 'AI app development in New York. We design and build AI web apps and AI MVPs that people use every day, from the first call to launch.',
    kicker: 'AI app development',
    h1: <>AI apps that do <em>real work.</em></>,
    lede: 'We build web apps where the AI is the product, not a chat box bolted on. It reads, sorts, drafts and decides alongside the people using it, and it shows its sources.',
    points: [
      ['AI features people trust', 'Every answer can be traced back to what it was built from. People approve the steps that matter.'],
      ['Built on the models that fit', 'We pick the model for the job, keep prompts and evaluations in the codebase, and swap models without a rewrite.'],
      ['A real product around it', 'Accounts, data, payments and an interface that makes sense on day one.'],
    ],
    priceNote: 'AI apps are priced in the written scope after a call, because no two are the same size.',
    cases: ['utern', 'validate'],
  },
  {
    slug: 'web-app-development', path: '/services/web-app-development', nav: 'Web app development',
    title: 'Custom Web App Development in New York | Next.js Agency NYC | SparkTech Studio',
    description: 'Custom web app development in New York. We build fast, maintainable web apps on Next.js and React, with real accounts, data and payments.',
    kicker: 'Web app development',
    h1: <>Custom web apps, <em>built to last.</em></>,
    lede: 'Dashboards, portals, marketplaces, internal tools. We build web apps on Next.js and React that stay fast and stay standing when the traffic shows up.',
    points: [
      ['Next.js and React', 'A stack your next hire already knows, so the code doesn’t trap you with us.'],
      ['The hard parts done properly', 'Sign-in, permissions, data, payments and email, set up once and set up right.'],
      ['Checked in a real browser', 'Every release is clicked through before it ships, not just compiled.'],
    ],
    priceNote: 'Web apps are priced in the written scope after a call.',
    cases: ['leed', 'ballotwatch'],
  },
  {
    slug: 'web-design', path: '/services/web-design', nav: 'Website design',
    title: 'Web Design Agency NYC | Premium Website Design in New York | SparkTech Studio',
    description: 'Premium website design and development in New York. A Launch Site package from $12k to $25k: design, build, CMS and SEO, usually in 3 to 5 weeks.',
    kicker: 'Website design and development',
    h1: <>A website that looks <em>like you mean it.</em></>,
    lede: 'Your site is the first meeting most people have with you. We design and build sites that load fast, read clearly, and turn a visit into a call.',
    points: [
      ['Designed, not templated', 'Type, layout and motion made for your company, then built by the same people who designed it.'],
      ['Found in search', 'Clean markup, real page titles, structured data and a sitemap, set up before launch.'],
      ['Yours to edit', 'A CMS for the pages you change often, so updates don’t wait on us.'],
    ],
    package: 'launch',
    cases: ['ballotwatch', 'utern'],
  },
  {
    slug: 'startup-mvp', path: '/services/startup-mvp', nav: 'Startup MVPs',
    title: 'MVP Development Company in NYC | Startup App Developers | SparkTech Studio',
    description: 'MVP development for startups in New York. We build the smallest version of your product that real people can use, then help you learn from it.',
    kicker: 'MVPs for startups',
    h1: <>The first version, <em>in real hands.</em></>,
    lede: 'An MVP is the smallest thing that tells you whether you’re right. We help you pick what to leave out, build the rest properly, and put it in front of real people.',
    points: [
      ['Scope that fits the question', 'We start from what you need to learn, then cut everything that doesn’t help you learn it.'],
      ['Built to keep, not to throw away', 'Real code on a real stack, so version two builds on version one.'],
      ['Measured from launch', 'You see who signs up, what they use and where they drop off.'],
    ],
    priceNote: 'MVPs are priced in the written scope after a call.',
    cases: ['validate', 'leed'],
  },
  {
    slug: 'retainers', path: '/services/retainers', nav: 'Care and Growth retainers',
    title: 'Website Maintenance NYC | SEO and Growth Retainers | SparkTech Studio',
    description: 'Website maintenance and SEO retainers in New York. Care from $1,000 to $1,500 a month. Growth from $3,000 to $5,000 a month.',
    kicker: 'Maintenance and growth retainers',
    h1: <>Launch is <em>day one.</em></>,
    lede: 'Sites and apps start aging the day they ship. A retainer keeps yours fast, fixed and getting better, with a set number of hours each month.',
    points: [
      ['Care', 'Hosting oversight, updates, uptime checks and small fixes.'],
      ['Growth', 'Care, plus new SEO pages, analytics and conversion tests that keep what works.'],
      ['A set number of hours', 'About 5 hours a month on Care and 15 on Growth. The rest of the terms are set in the written scope.'],
    ],
    package: ['care', 'growth'],
    cases: ['utern', 'ballotwatch'],
  },
]

export const industry = {
  slug: 'professional-services', path: '/industries/professional-services',
  title: 'Law Firm Web Design NYC | Financial Advisor and Medical Practice Websites | SparkTech Studio',
  description: 'Websites for law firms, financial advisors and medical practices in New York City and Long Island. Launch Site package from $12k to $25k.',
  kicker: 'Law, finance and medical',
  h1: <>Websites for firms <em>people trust.</em></>,
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
  todo: 'No professional-services case study yet. Add one real law, finance or medical client (with permission) before promoting this page.',
}

// Location pages. Each needs real local proof (a client, a partner, an office) before it is promoted.
// We have none we can publish yet, so each carries a TODO and stays out of the index until it is filled.
const loc = (slug, place, title, keywords, intro, near) => ({
  slug, path: `/locations/${slug}`, place, near,
  title: `${title} | SparkTech Studio`,
  description: `${keywords}. SparkTech Studio is an independent web and AI app studio in New York. Book a call.`,
  kicker: place,
  h1: <>Web and AI apps for <em>{place}.</em></>,
  lede: intro,
  cases: ['utern', 'ballotwatch'],
  todo: `Real local proof for ${place}: a client, partner or project here we can name with permission. Nothing published yet, so this page is noindex.`,
})

export const locations = [
  loc('new-york-city', 'New York City', 'Web Development Agency in New York City', 'Web development agency in New York City',
    'We’re a New York studio. We build AI web apps, MVPs and websites for companies across the five boroughs.', ['manhattan', 'brooklyn']),
  loc('manhattan', 'Manhattan', 'Manhattan Web Development Company', 'Manhattan web development company',
    'Websites and web apps for Manhattan companies and firms, from a studio in New York.', ['new-york-city', 'brooklyn']),
  loc('brooklyn', 'Brooklyn', 'Web Design Brooklyn | Brooklyn App Developer', 'Web design and app development in Brooklyn',
    'Websites and apps for Brooklyn companies, studios and startups, from a studio in New York.', ['new-york-city', 'manhattan']),
  loc('long-island', 'Long Island', 'Web Design and App Development on Long Island', 'Web design and app development on Long Island',
    'Websites and web apps for Long Island businesses in Nassau and Suffolk, from a studio in New York.', ['nassau-county', 'suffolk-county']),
  loc('nassau-county', 'Nassau County', 'Web Design Nassau County | Garden City Web Developer', 'Web design in Nassau County',
    'Websites and web apps for businesses in Nassau County, from Garden City to the North Shore.', ['long-island', 'suffolk-county']),
  loc('suffolk-county', 'Suffolk County', 'Web Design Suffolk County | Huntington Web Design', 'Web design in Suffolk County',
    'Websites and web apps for businesses in Suffolk County, from Huntington east.', ['long-island', 'nassau-county']),
]

// Every page this module adds, for the router and the prerender
export const pageRoutes = [
  ...services.map(s => ({ path: s.path, title: s.title, description: s.description })),
  { path: industry.path, title: industry.title, description: industry.description, noindex: false },
  ...locations.map(l => ({ path: l.path, title: l.title, description: l.description, noindex: true })),
]
