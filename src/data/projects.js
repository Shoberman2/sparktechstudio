// Everything in the "What We've Built" grid on the home page comes from this one list.
// To add a project, copy a block, change the words, save. That's it.
//
//   name      Spelled exactly as the brand spells it.
//   line      One short sentence. What it is, in plain words.
//   category  'Startup' | 'Client site' | 'AI agent'. A filter shows up for a category once one project uses it.
//   status    'Live' | 'Beta'
//   url       Where the link goes. host is the text of the link.
//   image     A real screenshot of it in /public, 800px wide or more, about 1200 by 630 in shape.
//   logo      A small square mark in /public. Leave '' and the card shows the name only.
//   stat      A real number you can back up, or ''. If it is '' nothing is shown. Never estimate one.
//   page      Optional. A case study on this site, like '/work/utern'.

export const CATEGORIES = ['Startup', 'Client site', 'AI agent']

export const projects = [
  {
    name: 'UTern',
    line: 'Your AI for landing an internship.',
    category: 'Startup',
    status: 'Live',
    url: 'https://utern.ai',
    host: 'utern.ai',
    logo: '/logo-utern.png',
    stat: 'About 3,000 users', // from Spencer, 2026-11-11
    image: '/work/utern/card.jpg',
    page: '/work/utern',
  },
  {
    name: 'BallotWatch',
    line: 'How Congress votes, in plain English.',
    category: 'Startup',
    status: 'Live',
    url: 'https://www.ballotwatch.io',
    host: 'ballotwatch.io',
    logo: '/logo-ballotwatch.svg',
    stat: '',
    image: '/work/ballotwatch/card.jpg',
    page: '/work/ballotwatch',
  },
  {
    name: 'Leed',
    line: 'Every tip a newsroom gets, read and kept safe.',
    category: 'Startup',
    status: 'Live',
    url: 'https://www.leed.media',
    host: 'leed.media',
    logo: '/logo-leed.svg',
    stat: '',
    image: '/work/leed/card.jpg',
    page: '/work/leed',
  },
  {
    name: 'Validate-s',
    line: 'Is this idea worth building?',
    category: 'Startup',
    status: 'Live',
    url: 'https://www.validate-s.com',
    host: 'validate-s.com',
    logo: '/work/validate/mark.svg',
    stat: '',
    image: '/work/validate/card.jpg',
    page: '/work/validate',
  },
  {
    name: 'Oasis VRX',
    line: 'A VR venue in New Jersey. We built its website.',
    category: 'Client site',
    status: 'Live',
    url: 'https://oasisvrx.com',
    host: 'oasisvrx.com',
    image: '/work/oasisvrx/card.jpg', // the live homepage, captured 2026-11-11
    logo: '',
    stat: '',
  },
]
