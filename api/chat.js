// The site assistant. Answers visitor questions from the site's own facts through the Vercel AI Gateway.
// Auth is the deployment's automatic OIDC token (VERCEL_OIDC_TOKEN), so there is no key or env var to set.
// Any failure returns an error and the panel tells the visitor to email; there is no canned fallback answer.
import { generateText } from 'ai'
import { knowledge } from '../src/site/facts.js'

const MODEL = 'anthropic/claude-haiku-4.5'
const recent = new Map() // ip -> timestamps, best-effort per-instance rate limit

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
  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  const messages = (Array.isArray(body?.messages) ? body.messages : [])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-12)
    .map(m => ({ role: m.role, content: m.content.slice(0, 1500) }))
  if (!messages.length || messages[messages.length - 1].role !== 'user') return res.status(400).json({ ok: false, error: 'Ask a question' })
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  if (tooMany(ip)) return res.status(429).json({ ok: false, error: 'Too many questions; try again later' })

  try {
    const { text } = await generateText({
      model: MODEL,
      instructions: knowledge(),
      messages,
      maxOutputTokens: 400,
      abortSignal: AbortSignal.timeout(25000),
    })
    const reply = text.replace(/—/g, ',').trim()
    if (!reply) throw new Error('empty reply')
    return res.status(200).json({ ok: true, reply })
  } catch (err) {
    console.error('chat failed', err?.message || err)
    return res.status(502).json({ ok: false, error: 'The assistant is unavailable' })
  }
}
