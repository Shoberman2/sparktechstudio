// Single source of truth for projects. Drives the Showcase tree.
// No screenshots: the work list is text-only by design.
// status: 'live' | 'building' | 'soon'
export const projects = [
  {
    key: 'ballotwatch',
    name: 'ballotwatch.io',
    url: 'https://ballotwatch.io',
    logo: '/logo-ballotwatch.svg',
    status: 'live',
    desc: 'Local government, made legible. Bills, reps, and voting records in one place.',
    tags: ['civic-tech', 'public-data', 'full-stack'],
  },
  {
    key: 'utern',
    name: 'utern.ai',
    url: 'https://utern.ai',
    logo: '/logo-utern.png',
    status: 'live',
    desc: 'Two AI agents run the internship hunt. One argues for the student, one screens for the recruiter.',
    tags: ['career-tech', 'ai-agents', 'consumer'],
  },
  {
    key: 'spacial-health',
    name: 'spacialhealth.com',
    url: 'https://spacialhealth.com',
    logo: '/logo-spacialhealth.png',
    status: 'live',
    desc: 'Telehealth for food allergies. Real allergy doctors and at-home treatment, anywhere in the US.',
    tags: ['health-tech', 'telehealth', 'consumer'],
  },
  {
    key: 'artstory',
    name: 'artstory',
    url: 'https://artstory-six.vercel.app',
    logo: '/logo-artstory.svg',
    status: 'live',
    desc: 'Scan a painting and get the whole story: the detail you missed, the painter, the world it was made in.',
    tags: ['ai', 'museums', 'consumer'],
  },
  {
    key: 'burnt',
    name: 'burnt',
    url: 'https://burnt-delta.vercel.app',
    logo: '/logo-burnt.svg',
    status: 'live',
    desc: 'Daily AI token tracking. Post what you burned, keep the streak, climb the leaderboard.',
    tags: ['ai', 'ios', 'social'],
  },
  {
    key: 'leed',
    name: 'leed.media',
    url: 'https://www.leed.media',
    logo: '/logo-leed.svg',
    status: 'live',
    desc: 'Stocks for stories. Leads land on a public signal board, AI clusters them, and only verified journalists see the source.',
    tags: ['journalism', 'ai', 'public-data'],
  },
]
