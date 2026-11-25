// Make one buyer's credit code: the Get Found Fix's $97 off the first month of the $500 Website Membership, one use,
// expiring 30 days from today. Run once per Get Found Fix delivery (briefs/get-found-fix.md):
//   WHOP_API_KEY=... node scripts/whop-credit-code.mjs
// The key needs promo_code:create. It is read from the environment and never printed.
const KEY = (process.env.WHOP_API_KEY || '').replace(/\s+/g, '')
if (!KEY) throw new Error('Set WHOP_API_KEY first.')
const ACCOUNT = 'biz_LYMNQMzNiBtz0U', MEMBERSHIP_PLAN = 'plan_Ff0Shq1WiR7Ra'
const code = 'FIX' + Math.random().toString(36).slice(2, 8).toUpperCase()
const expires = new Date(Date.now() + 30 * 864e5)
const res = await fetch('https://api.whop.com/api/v1/promo_codes', {
  method: 'POST',
  headers: { Authorization: `Bearer ${KEY}`, 'Api-Version-Date': '2026-11-23-3', Accept: 'application/json', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    account_id: ACCOUNT, code, promo_type: 'flat_amount', amount_off: 97, base_currency: 'usd',
    promo_duration_months: 1, variant_ids: [MEMBERSHIP_PLAN], stock: 1, unlimited_stock: false,
    one_per_customer: true, new_users_only: false, expires_at: expires.toISOString(),
  }),
})
const body = await res.json().catch(() => ({}))
if (!res.ok) { console.error(`Whop answered ${res.status}: ${JSON.stringify(body.error || body).slice(0, 300)}`); process.exit(1) }
console.log(`Code ${code}: $97 off the first month of the membership, one use, expires ${expires.toISOString().slice(0, 10)}.`)
console.log('Join link: https://whop.com/checkout/plan_Ff0Shq1WiR7Ra (they enter the code at checkout)')
