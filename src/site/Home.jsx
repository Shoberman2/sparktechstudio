import { useEffect } from 'react'
import { Shell, Book, Sec, Faq, JsonLd, Band } from './ui.jsx'
import Features from './Features.jsx'
import { PlanCard } from './Plan.jsx'

// Home (2026-11-18, eighth pass). Gold and black throughout, over a still fluid gold ground (public/home/fluid.svg).
// The statement with Book a call (Calendly) first, the services wheel, then the subscription card.
// No product list, no location, no person's name. Every number here is one the founder gave us.

// Home FAQ (founder, 2026-11-21: "add an FAQ at the bottom"). Only facts the site already states. No promised rankings.
// The $500 a month plan is stated the same way everywhere (card, FAQ, llms.txt, the assistant, structured data): founder, 2026-11-21.
const faq = [
  ['What does SparkTech Studios do?', 'We design and build websites, keep them running, and help them get found on Google and in AI answers. We also build AI agents, apps and startups.'],
  ['How does a project start?', 'You book a call. We send a written scope with what we’ll build, what it costs and when. Then we build it and launch it.'],
  ['What does it cost?', 'Small business websites are $500 a month. That covers the build, maintenance and your updates, with no build fee. Bigger projects like apps and AI agents are priced after a call.'],
  ['How fast can my site be live?', 'Days, not months. The dates go in the written scope.'],
  ['What are SEO and AEO?', 'SEO helps people find you on Google. AEO helps AI tools like ChatGPT and Perplexity name you in their answers.'],
  ['Who owns the site?', 'Ownership, access and support are spelled out in the written scope before any work starts.'],
]
const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
// The plan on the card, for search engines and AI answers
const planLd = { '@context': 'https://schema.org', '@type': 'Service', name: 'Small business website membership', serviceType: 'Website design, maintenance and updates', url: 'https://www.sparktechstudio.com/#pricing', provider: { '@id': 'https://www.sparktechstudio.com/#org' }, description: 'We design and build your website, maintain it and make your updates. No build fee.', offers: { '@type': 'Offer', priceSpecification: { '@type': 'UnitPriceSpecification', price: 500, priceCurrency: 'USD', unitText: 'MONTH' } } }

export default function Home() {
  // Arriving from another page at /#services or /#pricing: the wheel only gets its full height once scripts run,
  // so the browser's own jump lands in the wrong place. Jump again once the layout has settled.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    // Service ids on the reel (/#seo, /#apps...) are handled by Features.jsx, which lands the wheel on that service
    if (!id || document.querySelector(`.wheel [id="${CSS.escape(id)}"]`)) return
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' }), 120)
    return () => clearTimeout(t)
  }, [])
  return <Shell title="SparkTech Studios" className="st-home" band={false}>
    <section className="hero hero-home">
      <h1>We Make Your Business The One People Find.</h1>
      <div className="actions"><Book from="hero" /><a className="btn ghost" href="/grader">Score my site</a></div>
    </section>

    <Features />

    <section className="sec plan" id="pricing" aria-labelledby="price-title">
      <div className="wrap plan-in">
        <h2 id="price-title" className="sr">Pricing</h2>
        <div className="reveal"><PlanCard /></div>
      </div>
    </section>

    {/* The closing band sits above the FAQ on the home page (founder, 2026-11-21) */}
    <Band />

    <JsonLd data={faqLd} />
    <JsonLd data={planLd} />
    <Sec title="Questions" id="faq"><Faq items={faq} /></Sec>

  </Shell>
}
