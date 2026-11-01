// Plain facts, no JSX, so both the site (Direction B) and the assistant function (api/chat.js) read the same source.
// Nothing here is invented: products and screens are the live sites, prices are the published packages.

export const EMAIL = 'contactus@sparktechstudio.com'

export const pricing = {
  launch: { name: 'Launch Site', price: '$12k to $25k', unit: 'one time', scope: 'Design, build, a CMS you can edit, and SEO set up from day one. Usually 3 to 5 weeks.' },
  updates: { name: 'Website updates', price: '$500', unit: 'a month', scope: 'Edits and updates to your site.' },
  care: { name: 'Care', price: '$1,000 to $1,500', unit: 'a month', scope: 'Hosting oversight, updates, uptime checks and small fixes. About 5 hours a month.' },
  growth: { name: 'Growth', price: '$3,000 to $5,000', unit: 'a month', scope: 'Everything in Care, plus new SEO pages, analytics and conversion tests. About 15 hours a month.' },
}
export const scopedNote = 'AI agents and apps are priced after a call.'
export const replyNote = 'We reply within two business days.'

// The work, in the order the home page shows it. `device` picks the frame each product section uses.
export const products = [
  { slug: 'utern', name: 'UTern', host: 'utern.ai', url: 'https://utern.ai', line: 'Helps students land an internship.', device: 'phone' },
  { slug: 'leed', name: 'Leed', host: 'leed.media', url: 'https://www.leed.media', line: 'A tip line for newsrooms.', device: 'laptop' },
  { slug: 'ballotwatch', name: 'BallotWatch', host: 'ballotwatch.io', url: 'https://www.ballotwatch.io', line: 'How Congress votes, in plain English.', device: 'laptop' },
  { slug: 'validate', name: 'Validate-s', host: 'validate-s.com', url: 'https://www.validate-s.com', line: 'Checks if an idea is worth building.', device: 'phone' },
]
export const client = { slug: 'oasis', name: 'Oasis VRX', host: 'oasisvrx.com', url: 'https://oasisvrx.com', line: 'A VR venue in New Jersey. We built their website.', device: 'laptop' }

// Services in order, each with one plain line. The home page shows only websites, AI agents and website updates.
export const serviceList = [
  ['Websites', '/services/web-design', 'A fast site you can edit yourself.'],
  ['AI agents', '/services/ai-agents', 'AI that answers, sorts and follows up for you.'],
  ['AI apps', '/services/ai-app-development', 'Apps where the AI does the main job.'],
  ['Web apps', '/services/web-app-development', 'Portals, dashboards and tools for your team.'],
  ['MVPs', '/services/startup-mvp', 'A first version you can put in front of people.'],
  ['Website updates', '/services/retainers', 'We edit your site and keep it current.'],
  ['Care and Growth', '/services/retainers', 'Updates, fixes and new pages after launch.'],
  ['Law, finance and medical', '/industries/professional-services', 'Sites for firms that need to look trusted.'],
]


export const about = 'Spencer Hoberman founded SparkTech Studio in New York. He also builds UTern, an independent company.'

// The assistant's grounding. Keep it to what the site says.
export function assistantContext() {
  const p = Object.values(pricing).map(x => `- ${x.name}: ${x.price} ${x.unit}. ${x.scope}`).join('\n')
  return `You are the assistant on sparktechstudio.com, the site of SparkTech Studio.

Facts you may use (do not invent anything beyond these):
- SparkTech Studio is Spencer Hoberman's independent studio in New York. Legal entity: SparkTech Studios, Inc. It is not affiliated with sparktechstudios.com (Ontario).
- It builds websites and sets up AI agents for businesses. It also builds AI apps, web apps and MVPs, and runs its own products.
- Services: ${serviceList.map(s => s[0]).join('; ')}.
- Website updates: $500 a month. We edit your site and keep it current, for businesses that just need changes made.
- AI agents: we set up AI agents that do real work for a business, like answering questions, sorting requests and following up. You decide what they can do and what they spend.
- Products: ${products.map(x => `${x.name} (${x.host}): ${x.line}`).join(' ')} UTern is an independent company that Spencer also builds.
- Client work: ${client.name} (${client.host}), a VR venue in New Jersey. SparkTech built their website. Say nothing more about it.
- Pricing:
${p}
- ${scopedNote}
- How a project runs: a call, then a written scope (what we build, cost, timeline; ownership, access and support are spelled out there), then build and launch, then optional ongoing improvement.
- ${replyNote}
- To start: use the "Book a call" button, or email ${EMAIL}.

Rules: answer in one to three short sentences, plain and direct, no em dashes, no emoji, no markdown headings. If you do not know, say so and suggest booking a call. Never invent clients, numbers, timelines, testimonials or features. When someone describes a project or asks about cost or timing, point them to Book a call.`
}

export const screen = (slug, kind) => `/screens/${slug}-${kind}.webp`
