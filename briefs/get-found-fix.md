# Get Found Fix ($47): how to deliver it, and the test it is part of

Started 2026-11-25. Spencer picked this as the cheaper step before the $500 a month Website Membership, at $97, then
moved it to $47 the same night (the Whop price, the site and the credit code all say $47).

- Whop page: https://whop.com/sparktech-studios/get-found-fix/ (product `prod_BhBXHPNJGlq53`)
- Checkout: https://whop.com/checkout/plan_MlrNOWCL0lF7o (one payment of $47; it asks for "Your website address")
- On the site: a second button, "Get the fixes for $47", in the free checker's results (`src/site/Grader.jsx`), shown only
  when the checker found something to fix. Book a call stays first.

## What the buyer was promised (the Whop listing, word for word where it matters)

Within 3 business days:
- New titles and descriptions for up to 5 pages
- Their business details in the format Google and AI tools read (structured data)
- An llms.txt file: a plain summary of the business for AI tools
- A check that AI tools are allowed to read the site, with the fix if they're not
- A 10-minute video showing each fix and where it goes

And: "Join within 30 days and your $47 counts toward your first month." No rankings are promised.

## Delivering one order (by hand, no automation yet)

Aim for under an hour. Write down how long it really took (see the log).

1. **Find the site.** Whop dashboard, the payment for Get Found Fix, the "Your website address" answer.
2. **Run the free checker** on it at https://www.sparktechstudio.com/grader and save the report.
3. **Read the site**: the home page and the four pages that matter most to its customers.
4. **Write the fixes**, using only facts the site itself states (never invent a phone, address, hours or reviews):
   - A title (at most 60 characters) and a description (at most 155) for each of up to 5 pages.
   - Structured data (JSON-LD): Organization or LocalBusiness with the name, website, logo, and the phone, email and
     address only if the site shows them publicly. Add FAQPage only for questions the page really answers.
   - An `llms.txt`: who they are, what they offer, prices if the site publishes them, how to contact them.
   - `robots.txt`: if it blocks GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot or Google-Extended, the corrected file.
5. **Record the video** (10 minutes or less): each fix and where it goes on their platform (WordPress, Wix, Squarespace,
   Shopify, Webflow or custom).
6. **Make their credit code**: `WHOP_API_KEY=... node scripts/whop-credit-code.mjs` gives a one-use code for $47 off the
   membership's first month, valid 30 days.
7. **Send it** (Whop chat or email): the files, the video link, the code, and one line: "Want us to put these in and keep
   them current? Book a call or start the membership with your code: https://whop.com/checkout/plan_Ff0Shq1WiR7Ra".
8. **Log it** below.

## The test (Lean Startup)

- **Value hypothesis:** owners of small business sites who just saw a low score in the free checker will pay $47 to get
  the fixes done for them, even though the checker itself is free.
- **Growth hypothesis:** seeing their own fixes, some buyers will hand the work to us for $500 a month.
- **Early customer:** the owner of a small local business (a practice, a contractor, a restaurant) with an existing,
  dated site, who ran the checker on it.

Riskiest assumptions, in order:
1. People pay $47 when the checker is free.
2. At least 1 in 5 buyers joins the membership within 30 days.
3. One delivery takes under an hour, so $47 is worth doing by hand.

Numbers to read (each tied to real people, compared week by week, never as running totals):
- Vercel Analytics: `grader_done` (checks run), `fix_kit_click` with `score` (80+, 50-79, under-50) and `from`.
- Whop: payments on `plan_MlrNOWCL0lF7o` (buyers); membership payments on `plan_Ff0Shq1WiR7Ra` made with a `FIX` code
  (upgrades).
- This log: hours per delivery.

Pass marks, set before the test:
- **By 2026-12-09:** at least 3 Get Found Fix sales.
- **30 days after the 5th sale (or by 2027-01-08):** at least 1 of the first 5 buyers has joined the membership.
- Every delivery under an hour.

If a mark is missed, pivot rather than polish: try the $49 video teardown (cheaper and quicker), or the $199 one-page
site in 72 hours (stronger proof). If sales come but nobody upgrades, change what the delivery asks for (offer to
install the fixes as the first month's work). Nothing gets automated until the marks are met.

## Log

| Date paid | Site | Score | Delivered | Hours | Code | Joined membership? | Notes |
|---|---|---|---|---|---|---|---|
