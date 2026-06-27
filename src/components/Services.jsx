import './Services.css'

const services = [
  {
    id: '01',
    name: 'web_apps',
    desc: 'Full-stack products built from scratch. Real databases, real APIs, real auth. Built to scale past the demo, not just survive it.',
    stack: ['React', 'Vite', 'Node', 'Postgres'],
  },
  {
    id: '02',
    name: 'mobile_apps',
    desc: 'iOS and Android that feel native and ship to the store. The swipe-fast, opens-instantly kind, not a wrapped website.',
    stack: ['SwiftUI', 'React Native', 'Expo'],
  },
  {
    id: '03',
    name: 'ai_products',
    desc: 'LLM features, agents, and tools wired into real workflows. Useful AI that does a job, not a chatbot bolted onto a sidebar.',
    stack: ['Claude', 'Agents', 'RAG', 'Eval'],
  },
  {
    id: '04',
    name: 'mvp_to_prod',
    desc: 'Zero to a product real users touch. The unglamorous parts, payments, infra, deploys, monitoring, all handled so it stays up.',
    stack: ['Vercel', 'Stripe', 'CI/CD'],
  },
  {
    id: '05',
    name: 'design_brand',
    desc: 'Identity, interface, and the small details that make a product feel expensive. The thing you are actually proud to show people.',
    stack: ['Brand', 'UI/UX', 'Motion'],
  },
  {
    id: '06',
    name: 'rescue_scale',
    desc: 'Inherit a stalled build or a prototype that buckled under load. We read the code, stop the bleeding, and get it shipped.',
    stack: ['Audit', 'Refactor', 'Scale'],
  },
]

export default function Services() {
  return (
    <section className="services" id="services">
      <div className="services-inner">
        <header className="services-header reveal">
          <p className="prompt">
            <span className="prompt-sign">spark@studio</span>:<span className="prompt-path">~</span>$ ls ~/services
          </p>
          <h2>// what we build</h2>
          <p className="services-lead">
            Not a one-trick shop, and not a body shop. A small senior team that
            takes an idea end to end, from the first sketch to a thing in
            production with your name on it.
          </p>
        </header>

        <div className="services-grid reveal-stagger">
          {services.map((s) => (
            <article className="service reveal" key={s.id}>
              <div className="service-top">
                <span className="service-id">{s.id}</span>
                <span className="service-name">{s.name}<span className="service-paren">()</span></span>
              </div>
              <p className="service-desc">{s.desc}</p>
              <div className="service-stack">
                {s.stack.map((t) => (
                  <span className="service-tag" key={t}>{t}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
