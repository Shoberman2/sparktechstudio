// Plain facts, no JSX, so both the site (Direction B) and the assistant function (api/chat.js) read the same source.
// Nothing here is invented: products and screens are the live sites, prices are the published packages.

export const EMAIL = 'contactus@sparktechstudio.com'

export const pricing = {
  launch: { name: 'Launch Site', price: '$12k to $25k', unit: 'one time', scope: 'Design, build, a CMS you can edit, and SEO set up from day one. Usually 3 to 5 weeks.' },
  care: { name: 'Care', price: '$1,000 to $1,500', unit: 'a month', scope: 'Hosting oversight, updates, uptime checks and small fixes. About 5 hours a month.' },
  growth: { name: 'Growth', price: '$3,000 to $5,000', unit: 'a month', scope: 'Everything in Care, plus new SEO pages, analytics and conversion tests. About 15 hours a month.' },
}
export const scopedNote = 'AI apps, web apps, MVPs and agent systems are priced in a written scope after a call.'
export const replyNote = 'We reply within two business days.'

// The work, in the order the home page shows it. `device` picks the frame each product section uses.
export const products = [
  { slug: 'utern', name: 'UTern', host: 'utern.ai', url: 'https://utern.ai', line: 'AI for landing an internship, guided by Birdee.', device: 'phone' },
  { slug: 'leed', name: 'Leed', host: 'leed.media', url: 'https://www.leed.media', line: 'Tip intake for newsrooms, with Sherlock on the desk.', device: 'laptop' },
  { slug: 'ballotwatch', name: 'BallotWatch', host: 'ballotwatch.io', url: 'https://www.ballotwatch.io', line: 'How Congress votes, in plain English.', device: 'laptop' },
  { slug: 'validate', name: 'Validate-s', host: 'validate-s.com', url: 'https://www.validate-s.com', line: 'Is this idea worth building?', device: 'phone' },
]
export const client = { name: 'Oasis VRX', host: 'oasisvrx.com', url: 'https://oasisvrx.com', line: 'A VR venue in New Jersey. We built their website.' }

// Service names as the home page's sentence-list shows them, in order, each linking to its page.
export const serviceList = [
  ['AI app development', '/services/ai-app-development'],
  ['Agent harnessing and agent swarms', '/services/ai-agents'],
  ['Web app development', '/services/web-app-development'],
  ['Website design', '/services/web-design'],
  ['Startup MVPs', '/services/startup-mvp'],
  ['Care and Growth retainers', '/services/retainers'],
  ['Law, finance and medical sites', '/industries/professional-services'],
]

export const flow = [
  ['Call', 'We talk through what you want built.'],
  ['Written scope', 'What we build, what it costs, and when.'],
  ['Build and launch', 'Designed, built, tested in a real browser, shipped.'],
  ['Keep improving', 'Fixes, updates and new pages after launch.'],
]

export const about = 'Spencer Hoberman founded SparkTech Studio in New York. He also builds UTern, an independent company.'

// The assistant's grounding. Keep it to what the site says.
export function assistantContext() {
  const p = Object.values(pricing).map(x => `- ${x.name}: ${x.price} ${x.unit}. ${x.scope}`).join('\n')
  return `You are the assistant on sparktechstudio.com, the site of SparkTech Studio.

Facts you may use (do not invent anything beyond these):
- SparkTech Studio is Spencer Hoberman's independent studio in New York. Legal entity: SparkTech Studios, Inc. It is not affiliated with sparktechstudios.com (Ontario).
- It builds AI web apps, MVPs, websites and agent systems, and runs its own products.
- Services: ${serviceList.map(s => s[0]).join('; ')}.
- Agent harnessing and agent swarms: we design, wire and run AI agents and coordinated multi-agent systems that do real work for a business. People set the goals, budget and limits.
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
