import { systems } from '../designs/content.jsx'
import { Shell, PageHead, Sec, Flow, List } from './ui.jsx'

// /systems: the improvement loop, told broadly. No individual agents or their tasks are named anywhere on the site.
const loop = [
  ['Observe', 'See what’s really happening.'],
  ['Decide', 'Pick one thing worth improving.'],
  ['Build', 'Make the change, inside set limits.'],
  ['Verify', 'Test it in a real browser.'],
  ['Learn', 'Remember it for next time.'],
]
const keeps = [
  ['People set the limits', 'What it may touch, how much it may spend, and for how long.'],
  ['Nothing ships unverified', 'Every change is tested before it goes live.'],
  ['Every run is on the record', 'What it saw, what it changed, and what it learned, kept as evidence.'],
]

export default function System() {
  return <Shell title="System | SparkTech Studio">
    <PageHead h1="Software That Keeps Getting Better" lede="Most software starts aging the day it launches. Ours runs in a loop that keeps improving it." />
    <Sec title="One Loop, On Repeat"><Flow steps={loop} label="The improvement loop" /></Sec>
    <Sec title="Where It Points" line="Product first. The rest is what we are building toward."><List items={systems.areas.map(([h, p]) => [h, p])} /></Sec>
    <Sec title="What Never Changes"><List items={keeps} /><p className="note reveal">{systems.status}</p></Sec>
  </Shell>
}
