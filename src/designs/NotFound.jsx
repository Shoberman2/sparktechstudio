import { BOOK } from './content.jsx'
import { Shell, Section } from './Layout.jsx'
import { WorkList } from './Page.jsx'

// Served for any route the router doesn't know; the build also writes it as 404.html.
export default function NotFound() {
  return <Shell title="Not here | SparkTech Studio">
    <section className="head wrap">
      <h1>That page isn’t here.</h1>
      <p className="lede">It may have moved, or it never existed. Everything that does is a click away.</p>
      <div className="actions"><a className="btn btn-primary" href="/">Back to the studio</a><a className="btn btn-line" {...BOOK}>Book a call</a></div>
    </section>
    <Section title="What we’ve built"><WorkList /></Section>
  </Shell>
}
