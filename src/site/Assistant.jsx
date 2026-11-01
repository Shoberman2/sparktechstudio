import { useEffect, useRef, useState } from 'react'
import { EMAIL } from './facts.js'

// The bottom-right assistant: the bolt mark as a round face, a small white chat panel, answers from /api/chat
// (Vercel AI Gateway, grounded in the site's own facts). If the call fails it says so and offers email; it never fakes an answer.
export default function Assistant() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [state, setState] = useState('idle') // idle | wait | error
  const face = useRef(null), input = useRef(null), log = useRef(null)

  useEffect(() => {
    if (!open) return
    input.current?.focus()
    const key = e => { if (e.key === 'Escape') { setOpen(false); face.current?.focus() } }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [open])
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }) }, [msgs, state, open])

  async function send(e) {
    e.preventDefault()
    const q = text.trim()
    if (!q || state === 'wait') return
    const next = [...msgs, { role: 'user', content: q }]
    setMsgs(next); setText(''); setState('wait')
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next }) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || !data.reply) throw new Error(data.error || String(r.status))
      setMsgs([...next, { role: 'assistant', content: data.reply }]); setState('idle')
    } catch {
      setState('error')
    }
  }

  return <>
    <button ref={face} type="button" className="ai-face" aria-label={open ? 'Close the assistant' : 'Ask SparkTech a question'} aria-expanded={open} aria-controls="ai-panel" onClick={() => setOpen(o => !o)}>
      <img src="/brand/sparktech-bolt-mark.png" width="30" height="29" alt="" />
    </button>
    {open && <div className="ai-panel" id="ai-panel" role="dialog" aria-label="Ask SparkTech">
      <div className="ai-head"><strong>Ask SparkTech</strong><button type="button" className="ai-close" onClick={() => { setOpen(false); face.current?.focus() }}>Close</button></div>
      <div className="ai-log" ref={log} aria-live="polite">
        <p className="ai-msg bot">Ask about what we build, prices, or how a project starts.</p>
        {msgs.map((m, i) => <p key={i} className={`ai-msg ${m.role === 'user' ? 'me' : 'bot'}`}>{m.content}</p>)}
        {state === 'wait' && <p className="ai-msg wait">Writing a reply…</p>}
        {state === 'error' && <p className="ai-msg bot">The assistant can’t answer right now. <a href={`mailto:${EMAIL}`}>Email us</a> instead.</p>}
      </div>
      <form className="ai-form" onSubmit={send}>
        <label className="sr" htmlFor="ai-q" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Your question</label>
        <input ref={input} id="ai-q" value={text} onChange={e => setText(e.target.value)} placeholder="Type a question" maxLength={1000} autoComplete="off" />
        <button className="btn" type="submit" disabled={!text.trim() || state === 'wait'}>Send</button>
      </form>
    </div>}
  </>
}
