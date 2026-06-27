// Single source of truth for projects.
// Drives both the hero status terminal (name + status) and the Showcase tree.
// status: 'live' | 'building' | 'soon'
export const projects = [
  {
    key: 'ballotwatch',
    name: 'ballotwatch.io',
    url: 'https://ballotwatch.io',
    logo: '/logo-ballotwatch.svg',
    status: 'live',
    desc: 'A civic-tech platform that makes local government legible. Track legislation, representatives, and voting records in one place.',
    does: 'Turns scattered public records into something a normal person can actually follow.',
    tags: ['civic-tech', 'public-data', 'full-stack'],
  },
  {
    key: 'utern',
    name: 'utern.ai',
    url: 'https://utern.ai',
    logo: '/logo-utern.png',
    status: 'live',
    desc: 'An AI internship platform run by two agents. Bob works for the student, Barb works for the recruiter. They handle the back and forth, and a match happens when both sides agree.',
    does: 'Gives every student an agent that argues their case, then matches when the recruiter agent signs off.',
    tags: ['career-tech', 'ai-agents', 'consumer'],
  },
  {
    key: 'spacial-health',
    name: 'spacialhealth.com',
    url: 'https://spacialhealth.com',
    logo: '/logo-spacialhealth.png',
    status: 'live',
    desc: 'Telehealth for food allergies. It connects people to real allergy doctors and proven at-home treatment plans, so families can build actual tolerance instead of just avoiding everything.',
    does: 'Puts expert food-allergy treatment on your phone. No referrals, anywhere in the US.',
    tags: ['health-tech', 'telehealth', 'consumer'],
  },
]
