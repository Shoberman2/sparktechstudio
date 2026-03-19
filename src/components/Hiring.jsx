import './Hiring.css'

const roles = [
  {
    title: 'Full-Stack Developer',
    type: 'Contract / Full-Time',
    desc: 'You can build an entire product from scratch and actually enjoy it. React, Node, databases, deployment. You like moving fast and figuring things out.',
  },
  {
    title: 'Marketer',
    type: 'Contract / Full-Time',
    desc: 'You know how to get a product in front of the right people. Growth, content, social, paid. You\'ve done it before and you\'re good at it.',
  },
  {
    title: 'Designer',
    type: 'Contract / Full-Time',
    desc: 'You think in systems but obsess over details. You can go from concept to high-fidelity and know what makes a product feel right, not just look right.',
  },
  {
    title: 'Wildcard',
    type: 'Tell Us',
    desc: 'You don\'t fit a job title but you build cool things. If you\'re the kind of person who ships side projects for fun, we want to hear from you.',
  },
]

export default function Hiring() {
  return (
    <section className="hiring" id="careers">
      <div className="hiring-inner">
        <div className="hiring-header reveal">
          <div className="hiring-label">Join Us</div>
          <h2>We're hiring people who build things</h2>
          <p>No corporate nonsense. No whiteboard interviews. Just show us what you've made and tell us what excites you.</p>
        </div>
        <div className="hiring-grid reveal-stagger">
          {roles.map((role, i) => (
            <div className="hiring-card reveal" key={i}>
              <div className="hiring-card-header">
                <h3>{role.title}</h3>
                <span className="hiring-type">{role.type}</span>
              </div>
              <p>{role.desc}</p>
              <a href="#waitlist" className="btn btn-outline btn-hiring">Get in touch</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
