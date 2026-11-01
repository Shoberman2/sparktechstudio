import { useEffect, useRef, useState } from 'react'
import { EMAIL } from './facts.js'
import './assistant.css'

// Bottom-right live helper. Answers come from api/chat.js (Vercel AI Gateway, grounded in src/b/facts.js).
// If the call fails it says so and offers the email link. There are no canned answers.
export default function Assistant() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(false)
  const input = useRef(null)
  const log = useRef(null)
  const face = useRef(null)

  useEffect(() => {
    if (!open) return
    input.current?.focus()
    const onKey = e => { if (e.key === 'Escape') { setOpen(false); face.current?.focus() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight }) }, [msgs, busy, err])

  async function send(e) {
    e.preventDefault()
    const q = text.trim()
    if (!q || busy) return
    const next = [...msgs, { role: 'user', content: q }]
    setMsgs(next); setText(''); setBusy(true); setErr(false)
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next.slice(-12) }) })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || !data.text) throw new Error('failed')
      setMsgs(m => [...m, { role: 'assistant', content: data.text }])
    } catch {
      setErr(true)
    } finally {
      setBusy(false)
    }
  }

  return <>
    <button ref={face} className={`as-face${open ? ' is-open' : ''}`} aria-label={open ? 'Close the assistant' : 'Ask SparkTech Studio a question'} aria-expanded={open} aria-controls="assistant" onClick={() => setOpen(o => !o)}>
      <img src="/brand/sparktech-bolt-128.png" width="30" height="29" alt="" />
    </button>
    {open && <section className="as-panel" id="assistant" role="dialog" aria-label="Ask SparkTech Studio">
      <header className="as-head">
        <strong>SparkTech Studio</strong>
        <button className="as-close" onClick={() => { setOpen(false); face.current?.focus() }}>Close</button>
      </header>
      <div className="as-log" ref={log} aria-live="polite">
        {msgs.length === 0 && <p className="as-hint">Ask about services, pricing or how a project starts.</p>}
        {msgs.map((m, i) => <p key={i} className={`as-msg as-${m.role}`}>{m.content}</p>)}
        {busy && <p className="as-msg as-assistant as-wait">Writing a reply</p>}
        {err && <p className="as-msg as-assistant as-err">The assistant could not answer just now. <a href={`mailto:${EMAIL}`}>Email us</a> and a person will reply.</p>}
      </div>
      <form className="as-form" onSubmit={send}>
        <label htmlFor="as-input" className="as-sr">Your question</label>
        <input id="as-input" ref={input} value={text} onChange={e => setText(e.target.value)} placeholder="Ask a question" maxLength={600} autoComplete="off" />
        <button className="btn btn-sm" type="submit" disabled={busy || !text.trim()}>Send</button>
      </form>
    </section>}
  </>
}
