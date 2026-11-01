// Plain facts shared by the site and the chat assistant (api/chat.js imports this file, so no JSX or CSS here).
// Every price and product line is published copy. Nothing here is a client, number or result we can't show.

export const EMAIL = 'contactus@sparktechstudio.com'
export const SITE = 'https://www.sparktechstudio.com'

export const pricing = {
  launch: { name: 'Launch Site', price: '$12k to $25k', unit: 'one time', scope: 'A marketing site built to rank and to convert: design, build, a CMS you can edit, and SEO set up from day one. Usually 3 to 5 weeks.', short: 'Design, build, a CMS you can edit, and SEO.' },
  updates: { name: 'Website updates', price: '$500', unit: 'a month', scope: 'Edits and updates to your site, so it stays current.', short: 'Edits and updates to your site.' },
  care: { name: 'Care', price: '$1,000 to $1,500', unit: 'a month', scope: 'Hosting oversight, updates, uptime checks and small fixes. About 5 hours a month.', short: 'Updates, uptime checks and small fixes. About 5 hours a month.' },
  growth: { name: 'Growth', price: '$3,000 to $5,000', unit: 'a month', scope: 'Everything in Care, plus new SEO pages, analytics and conversion tests. About 15 hours a month.', short: 'Care, plus SEO pages, analytics and tests. About 15 hours a month.' },
}
export const scoped = 'AI agents, apps and MVPs are priced after a call.'

// The services, in the order the site lists them
export const serviceList = [
  { slug: 'web-design', path: '/services/web-design', nav: 'Websites', line: 'A fast, clear site that gets you calls.' },
  { slug: 'website-updates', path: '/services/retainers', nav: 'Website updates', line: 'We edit your site and keep it current.' },
  { slug: 'ai-agents', path: '/services/ai-agents', nav: 'AI agents', line: 'AI that answers, sorts and follows up for you.' },
  { slug: 'ai-app-development', path: '/services/ai-app-development', nav: 'AI apps', line: 'Apps where the AI does the main job.' },
  { slug: 'web-app-development', path: '/services/web-app-development', nav: 'Web apps', line: 'Dashboards, portals and tools.' },
  { slug: 'startup-mvp', path: '/services/startup-mvp', nav: 'MVPs', line: 'A first version real people can use.' },
  { slug: 'retainers', path: '/services/retainers', nav: 'Monthly care', line: 'Updates, fixes and new pages after launch.' },
  { slug: 'professional-services', path: '/industries/professional-services', nav: 'Law, finance and medical sites', line: 'Sites for firms clients need to trust.' },
]

export const products = [
  { slug: 'utern', name: 'UTern', host: 'utern.ai', url: 'https://utern.ai', line: 'Your AI for landing an internship.' },
  { slug: 'leed', name: 'Leed', host: 'leed.media', url: 'https://www.leed.media', line: 'Every tip a newsroom gets, read and kept safe.' },
  { slug: 'ballotwatch', name: 'BallotWatch', host: 'ballotwatch.io', url: 'https://www.ballotwatch.io', line: 'How Congress votes, in plain English.' },
  { slug: 'validate', name: 'Validate-s', host: 'validate-s.com', url: 'https://www.validate-s.com', line: 'Is this idea worth building?' },
]

// Client work we can name. Say only this.
export const clients = [
  { name: 'Oasis VRX', host: 'oasisvrx.com', url: 'https://oasisvrx.com', line: 'A VR venue in New Jersey. We built its website.' },
]

// The system prompt for the bottom-right assistant, built from the same facts the pages show
export function knowledge() {
  return [
    'You are the assistant on sparktechstudio.com, the site of SparkTech Studio.',
    'Answer visitor questions in plain text, no markdown, in at most 80 words. Be direct and friendly. No em dashes.',
    'Only use the facts below. If something is not covered (team size, results, timelines for a specific project, anything else), say you do not know and suggest booking a call. Never invent clients, numbers, features or promises.',
    'When someone wants a project, a quote or details, point them to the "Book a call" button on the page, or email ' + EMAIL + '.',
    '',
    'FACTS',
    'SparkTech Studio is Spencer Hoberman\'s independent studio in New York, NY. Legal entity: SparkTech Studios, Inc. It builds websites and sets up AI agents for businesses, and runs its own products. Not affiliated with sparktechstudios.com (Ontario).',
    'Spencer also builds UTern, which is an independent company.',
    'Services: ' + serviceList.map(s => `${s.nav} (${s.line})`).join('; ') + '.',
    'AI agents: we set up AI agents that do real work for a business, like answering questions, sorting requests and following up, with a person approving what matters.',
    'Prices: ' + Object.values(pricing).map(p => `${p.name}, ${p.price} ${p.unit}: ${p.scope}`).join(' ') + ' ' + scoped,
    'How a project runs: a call, then a written scope (what we build, what it costs, when; ownership, access and support are spelled out there), then build and launch, then keep improving with an optional Website updates, Care or Growth plan.',
    'Website updates: $500 a month. We edit and update a business\'s website and keep it current. Details on /services/retainers and /pricing.',
    'Our products: ' + products.map(p => `${p.name} (${p.host}): ${p.line}`).join(' ') + ' Validate-s runs five AI agents that research and argue about an idea and score it out of 10.',
    'Client work: ' + clients.map(c => `${c.name} (${c.host}), ${c.line}`).join(' '),
    'We reply within two business days. Pages: /services, /services/ai-agents, /services/retainers, /work, /pricing.',
  ].join('\n')
}
