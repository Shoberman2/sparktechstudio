// The site assistant. Calls a model through Vercel AI Gateway with the site's own copy as context.
// Auth is the deployment's automatic OIDC token (VERCEL_OIDC_TOKEN), so there is no key or setting to add.
// On any failure it answers 502 and the panel shows the email address instead of a made-up reply.
import { generateText } from 'ai'
import { INSTRUCTIONS } from './_site-context.js'

const MODEL = 'anthropic/claude-haiku-4.5'
const recent = new Map() // ip -> [timestamps], best-effort per-instance rate limit

function tooMany(ip) {
  const now = Date.now()
  const times = (recent.get(ip) || []).filter(t => now - t < 10 * 60 * 1000)
  times.push(now)
  recent.set(ip, times)
  return times.length > 30
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'POST only' })
  }
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  if (tooMany(ip)) return res.status(429).json({ ok: false, error: 'Too many questions. Try again in a few minutes.' })

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  const messages = (Array.isArray(body?.messages) ? body.messages : [])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-12)
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }))
  if (!messages.length || messages[messages.length - 1].role !== 'user') return res.status(400).json({ ok: false, error: 'Ask a question' })

  try {
    const { text } = await generateText({ model: MODEL, instructions: INSTRUCTIONS, messages, maxOutputTokens: 300, temperature: 0.3 })
    const answer = String(text || '').replace(/—/g, ',').trim()
    if (!answer) throw new Error('empty answer')
    return res.status(200).json({ ok: true, text: answer })
  } catch (err) {
    console.error('chat failed', err?.message || err)
    return res.status(502).json({ ok: false, error: 'The assistant is not answering right now.' })
  }
}
