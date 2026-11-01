// The site assistant. Calls Vercel AI Gateway through the AI SDK with a plain "provider/model" string.
// On Vercel the gateway authenticates with the deployment's own OIDC token (VERCEL_OIDC_TOKEN), so there are no keys here.
// Grounded only in src/b/facts.js. On any failure it returns an error and the panel shows the email link.
import { generateText } from 'ai'
import { assistantContext } from '../src/b/facts.js'

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
    return res.status(405).json({ error: 'POST only' })
  }
  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  const list = Array.isArray(body?.messages) ? body.messages : []
  const messages = list.slice(-12)
    .filter(m => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }))
  if (!messages.length || messages[messages.length - 1].role !== 'user') return res.status(400).json({ error: 'Send a question' })
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  if (tooMany(ip)) return res.status(429).json({ error: 'Too many questions; try again later' })

  try {
    const { text } = await generateText({
      model: 'anthropic/claude-haiku-4.5',
      instructions: assistantContext(),
      messages,
      maxOutputTokens: 300,
    })
    return res.status(200).json({ text: text.replace(/—/g, ',').trim() })
  } catch (e) {
    console.error('chat failed', e?.message)
    return res.status(502).json({ error: 'The assistant is unavailable' })
  }
}
