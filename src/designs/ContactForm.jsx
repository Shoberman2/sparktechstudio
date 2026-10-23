import { useState } from 'react'
import { EMAIL } from './content.jsx'
import './ContactForm.css'

// Short project form. It posts to /api/contact (emails the studio through Resend when RESEND_API_KEY is set).
// If the endpoint is not configured or cannot be reached, it opens the visitor's email app with the same fields filled in.
const TYPES = ['Startup product', 'Small business website', 'Mobile app', 'Other']
// TODO(Spencer): confirm these budget ranges
const BUDGETS = ['Under $10k', '$10k to $25k', '$25k to $50k', '$50k and up', 'Not sure yet']

const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

function check(f) {
  const e = {}
  if (!f.name.trim()) e.name = 'Tell us your name'
  if (!isEmail(f.email.trim())) e.email = 'Enter a real email address'
  if (!f.type) e.type = 'Pick the closest one'
  if (f.message.trim().length < 10) e.message = 'Tell us a little more'
  return e
}

const body = f => `Project type: ${f.type}\nBudget: ${f.budget || 'Not given'}\n\n${f.message.trim()}`

function openMail(f) {
  const subject = `Project: ${f.type} (${f.name.trim()})`
  window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${body(f)}\n\n${f.name.trim()}`)}`
}

export default function ContactForm() {
  const [f, setF] = useState({ name: '', email: '', type: '', budget: '', message: '', company_website: '' })
  const [errors, setErrors] = useState({})
  const [state, setState] = useState('idle') // idle | sending | sent | mailto | error
  const [note, setNote] = useState('')
  const set = k => e => { setF({ ...f, [k]: e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: undefined }) }

  async function submit(e) {
    e.preventDefault()
    const found = check(f)
    setErrors(found)
    if (Object.keys(found).length) { e.currentTarget.querySelector(`[name="${Object.keys(found)[0]}"]`)?.focus(); return }
    setState('sending')
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: f.name.trim(), email: f.email.trim(), message: body(f), company_website: f.company_website }) })
      if (r.ok) { setState('sent'); return }
      if (r.status === 400 || r.status === 429) { const j = await r.json().catch(() => ({})); setNote(j.error || 'Something is off. Check the form and try again.'); setState('error'); return }
      throw new Error(String(r.status))
    } catch {
      // Not configured (503), not deployed (404), or offline: hand the message to the visitor's email app instead
      openMail(f)
      setState('mailto')
    }
  }

  if (state === 'sent') return <div className="cf-done" role="status"><strong>Thanks, {f.name.trim().split(' ')[0]}.</strong><p>We have your message and reply within two business days.</p></div>

  const field = (k, label, input) => <div className={`cf-field${errors[k] ? ' has-error' : ''}`}>
    <label htmlFor={`cf-${k}`}>{label}</label>
    {input}
    {errors[k] && <span className="cf-error" id={`cf-${k}-error`}>{errors[k]}</span>}
  </div>
  const a11y = k => ({ id: `cf-${k}`, name: k, 'aria-invalid': errors[k] ? true : undefined, 'aria-describedby': errors[k] ? `cf-${k}-error` : undefined })

  return <form className="cf" onSubmit={submit} noValidate>
    <div className="cf-row">
      {field('name', 'Name', <input {...a11y('name')} autoComplete="name" required value={f.name} onChange={set('name')} />)}
      {field('email', 'Email', <input {...a11y('email')} type="email" inputMode="email" autoComplete="email" required value={f.email} onChange={set('email')} />)}
    </div>
    <div className="cf-row">
      {field('type', 'Project type', <select {...a11y('type')} required value={f.type} onChange={set('type')}><option value="" disabled>Choose one</option>{TYPES.map(t => <option key={t}>{t}</option>)}</select>)}
      {field('budget', 'Budget range (optional)', <select {...a11y('budget')} value={f.budget} onChange={set('budget')}><option value="">Choose one</option>{BUDGETS.map(t => <option key={t}>{t}</option>)}</select>)}
    </div>
    {field('message', 'What should exist?', <textarea {...a11y('message')} rows="5" required value={f.message} onChange={set('message')} />)}
    {/* Honeypot: people never see it; bots fill it and are quietly accepted by the API */}
    <input className="cf-hp" tabIndex="-1" autoComplete="off" aria-hidden="true" name="company_website" value={f.company_website} onChange={set('company_website')} />
    <div className="cf-foot">
      <button className="btn" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending' : 'Send'}</button>
      <p className="cf-note" role="status">
        {state === 'mailto' ? <>Your email app should open with your message filled in. If it didn’t, <a href={`mailto:${EMAIL}`}>email us</a>.</> : state === 'error' ? note : 'We reply within two business days.'}
      </p>
    </div>
  </form>
}
