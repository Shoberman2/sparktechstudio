// Inbound: the contact form posts here and the message is emailed to the studio.
// Needs RESEND_API_KEY (Vercel Resend integration) and optionally CONTACT_TO / CONTACT_FROM.
// Without the key the endpoint answers 503 and the form shows the direct email instead.

const MAX = { name: 120, email: 200, message: 4000 };
const recent = new Map(); // ip -> [timestamps], best-effort per-instance rate limit

function tooMany(ip) {
  const now = Date.now();
  const times = (recent.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  times.push(now);
  recent.set(ip, times);
  return times.length > 5;
}

function clean(value, limit) {
  const text = Array.from(String(value || '')).filter(ch => ch.charCodeAt(0) >= 32 || ch === '\n' || ch === '\t').join('');
  return text.trim().slice(0, limit);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'POST only' });
  }
  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ ok: false, error: 'Email is not configured yet' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  if (body.company_website) return res.status(200).json({ ok: true }); // honeypot: silently accept
  const name = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email);
  const message = clean(body.message, MAX.message);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: 'Enter a real email address' });
  if (message.length < 10) return res.status(400).json({ ok: false, error: 'Tell us a little more' });
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (tooMany(ip)) return res.status(429).json({ ok: false, error: 'Too many messages; try again later' });

  const to = process.env.CONTACT_TO || 'spencer@sparktechstudio.com';
  const from = process.env.CONTACT_FROM || 'SparkTech site <onboarding@resend.dev>';
  const text = `From: ${name || '(no name)'} <${email}>\nIP: ${ip}\n\n${message}\n`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], reply_to: email, subject: `Site contact: ${name || email}`, text }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    console.error('resend failed', r.status, detail.slice(0, 300));
    return res.status(502).json({ ok: false, error: 'Could not send right now' });
  }
  return res.status(200).json({ ok: true });
}
