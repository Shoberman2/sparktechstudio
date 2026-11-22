// Plain facts shared by the site and the chat assistant (api/chat.js imports this file, so no JSX or CSS here).
// Every price and product line is published copy. Nothing here is a client, number or result we can't show.

export const EMAIL = 'contactus@sparktechstudio.com'
export const SITE = 'https://www.sparktechstudio.com'

// Social accounts, shown in the footer. An entry with no url is left out.
// When these are filled, also add them as "sameAs" on the Organization in index.html's JSON-LD.
// TODO(Spencer): paste the real profile links. Do not guess them.
export const SOCIALS = [
  { name: 'LinkedIn', url: '' },
  { name: 'X', url: '' },
  { name: 'Instagram', url: '' },
  { name: 'TikTok', url: '' },
]

// Spencer, 2026-11-16 (PR #5, merged 2026-11-21): SparkTech services are a flat $500 a month per business, no matter what.
// Spencer, 2026-11-21: the price shows on the membership card, and every other source (FAQ, llms.txt, the assistant,
// structured data) states it the same way. Service pages show no price section.
export const pricing = {
  site: { name: 'SparkTech services', price: '$500', unit: 'a month', scope: 'A flat $500 a month per business, no matter what. It covers the build, maintenance and your updates, with no build fee.', short: 'Build, maintenance and updates. One price.' },
}
export const scoped = 'Every service is a flat $500 a month per business, no matter what.'

// The services, in the order the site lists them
export const serviceList = [
  { slug: 'web-design', path: '/services/web-design', nav: 'Websites', line: 'A fast, clear site that gets you calls.' },
  { slug: 'ai-agents', path: '/services/ai-agents', nav: 'AI agents', line: 'AI that answers, sorts and follows up for you.' },
  { slug: 'website-updates', path: '/services/retainers', nav: 'Website updates', line: 'We edit your site and keep it current.' },
  { slug: 'seo-aeo', path: '/services/seo-aeo', nav: 'SEO and AEO', line: 'Get found on Google and in AI answers like ChatGPT and Perplexity.' },
  { slug: 'ai-app-development', path: '/services/ai-app-development', nav: 'AI apps', line: 'Apps where the AI does the main job.' },
  { slug: 'web-app-development', path: '/services/web-app-development', nav: 'Web apps', line: 'Dashboards, portals and tools.' },
  { slug: 'startup-mvp', path: '/services/startup-mvp', nav: 'MVPs', line: 'A first version real people can use.' },
  { slug: 'retainers', path: '/services/retainers', nav: 'Monthly care', line: 'Updates, fixes and new pages after launch.' },
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
    'You are the assistant on sparktechstudio.com, the site of SparkTech Studios.',
    'Answer visitor questions in plain text, no markdown, in at most 80 words. Be direct and friendly. No em dashes.',
    'Only use the facts below. If something is not covered (team size, results, timelines for a specific project, anything else), say you do not know and suggest booking a call. Never invent clients, numbers, features or promises.',
    'When someone wants a project, a quote or details, point them to the "Book a call" button on the page, or email ' + EMAIL + '.',
    '',
    'FACTS',
    'SparkTech Studios is an independent studio. Never name the founder or any person at the studio. Do not state a city or location for the studio. Legal entity: SparkTech Studios, Inc. It builds websites, sets up AI agents, and does SEO and AEO for businesses, and builds out startups. Not affiliated with sparktechstudios.com (Ontario).',
    'Services: ' + serviceList.map(s => `${s.nav} (${s.line})`).join('; ') + '.',
    'AI agents: we set up AI agents that do real work for a business, like answering questions, sorting requests and following up, with a person approving what matters.',
    'Prices: SparkTech services are a flat $500 a month per business, no matter what: websites, SEO and AEO, AI agents, AI apps, web apps and MVPs. It covers the build, maintenance and updates, with no build fee. Never quote any other price.',
    'How a project runs: a call, then a written scope (what we build, what it costs, when; ownership, access and support are spelled out there), then build and launch. Maintenance and updates are part of the same monthly price.',
    'SEO and AEO: we help a business get found on Google (SEO) and named in AI answers from tools like ChatGPT and Perplexity (AEO). We fix the site basics, write pages that answer real customer questions, and make the business facts easy for AI tools to cite. Price: the flat $500 a month. Never promise rankings or results. Details on /services/seo-aeo.',
    'The flat $500 a month covers building, maintaining and updating. There is no separate build fee.',
    'We build out startups. Do not name or list any product, startup or company we have built; if asked, say we can talk through past work on a call.',
    'Free SEO and AEO checker at /grader, which we built ourselves: enter a website address and get a score out of 100 with a ranked list of fixes. It gives an overall score plus an SEO score (Google) and an AEO score (AI answers). SEO checks: mobile setup, HTTPS, title and description, the main heading, image alt text, share preview tags, broken links and a clear way to contact the business. AEO checks: whether AI tools like ChatGPT, Claude and Perplexity are allowed to read the site, structured data, a business entry AI can quote, whether the words are readable without JavaScript, answers to customer questions (FAQ), and an llms.txt file. No email needed to see the score.',
    'We reply within two business days. Pages: /services, /services/ai-agents, /services/seo-aeo, /services/retainers, /grader.',
  ].join('\n')
}
