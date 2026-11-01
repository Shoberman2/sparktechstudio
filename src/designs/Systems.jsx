import { Shell, Head, Section } from './Layout.jsx'
import { Rows } from './Page.jsx'

// The system, told broadly: five steps, where it points, what never changes, where it stands.
// No individual agents or their tasks are named anywhere on the site.
const loop = [
  ['Observe', 'See what’s really happening.'],
  ['Decide', 'Pick one thing worth improving.'],
  ['Build', 'Make the change, inside set limits.'],
  ['Verify', 'Test it for real before it ships.'],
  ['Learn', 'Remember it for next time.'],
]
const keeps = [
  ['People set the limits', 'What it may touch, how much it may spend, and for how long.'],
  ['Nothing ships unverified', 'Every change is tested in a real browser before it goes live.'],
  ['Every run is on the record', 'What it saw, what it changed, and what it learned, kept as evidence.'],
]

export default function Systems() {
  return <Shell title="System | SparkTech Studio">
    <Head h1="Software that keeps getting better." lede="Most software starts aging the day it launches. Ours runs in a loop that keeps improving it, with people in charge of what it may touch." cta={false} />
    <Section title="One loop, on repeat"><Rows items={loop} /></Section>
    <Section title="Where it points" className="split">
      <p className="text">The same loop, aimed at different parts of a company: product, growth, content, support and knowledge. Product runs today. The rest is next.</p>
    </Section>
    <Section title="What never changes"><Rows items={keeps} /></Section>
    <Section title="Where this stands" className="split">
      <p className="text">Today the loop runs on our own site. On October 11, 2026 it found a bug there, fixed it, verified the fix, and shipped it on its own. The products we’ve built are next, one at a time.</p>
    </Section>
  </Shell>
}
