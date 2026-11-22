# SparkTech Outreach MVP (local sandbox)

This is an email-first local workflow for company-owned outreach operations. It
supports tenant-scoped ICPs, reviewer-attested source facts, synthetic or
company-local prospect records, multi-step campaigns, draft review, explicit
approvals, durable scheduled jobs, caps/windows, suppression, inbound-event
fixtures, idempotent mock delivery, and an audit trail. The only runnable
delivery provider in this release writes to a local SQLite mock outbox.

The local review queue renders both plaintext and escaped HTML using the
company's selected theme. Built-in themes are SparkTech, Sherlock/LEED, Ballot
Watch, and UTern Bluebird. LEED's checked-in mark is monochrome; Ballot Watch's
navy is taken from its local favicon; UTern's warm paper and blue palette
follows the read-only UTern landing stylesheet. No remote logo or tracking
image is embedded. Sender and project identity remain clear: SparkTech sends
for LEED and Ballot Watch, while UTern mail uses UTern as sender. No unverified
titles, signatures, links, or signature text are invented. Generate synthetic
previews for all themes offline:

```sh
python3 -m rsei.email_preview --out /tmp/sparktech-email-previews
```

The preview directory contains `.html` and `.txt` pairs for each theme.

## Try the synthetic walkthrough

Run from `systems/recursive-improvement` using Python 3.10 or later:

```sh
python3 -m rsei.outreach demo-init --db /tmp/spark-outreach-demo.sqlite
python3 -m rsei.outreach review --db /tmp/spark-outreach-demo.sqlite --company sparktech-demo
python3 -m rsei.outreach approve-campaign --db /tmp/spark-outreach-demo.sqlite --company sparktech-demo --campaign fixture-campaign --reviewer local-owner
python3 -m rsei.outreach approve-draft --db /tmp/spark-outreach-demo.sqlite --company sparktech-demo --campaign fixture-campaign --prospect fixture-prospect --step 1 --reviewer local-owner
python3 -m rsei.outreach approve-draft --db /tmp/spark-outreach-demo.sqlite --company sparktech-demo --campaign fixture-campaign --prospect fixture-prospect --step 2 --reviewer local-owner
python3 -m rsei.outreach schedule --db /tmp/spark-outreach-demo.sqlite --company sparktech-demo --campaign fixture-campaign --prospect fixture-prospect
python3 -m rsei.outreach worker --db /tmp/spark-outreach-demo.sqlite --company sparktech-demo --limit 1
python3 -m rsei.outreach report --db /tmp/spark-outreach-demo.sqlite --company sparktech-demo
python3 -m rsei.outreach live-status --db /tmp/spark-outreach-demo.sqlite --company sparktech-demo
```

The recipient and sender are `example.invalid` fixtures. The worker can only
write a mock outbox row. The second step is queued only after the first mock
delivery and after its separate approval. Approving the campaign or a draft is
an explicit local action; scheduling alone never approves content. A content
edit, changed campaign configuration, or stale source invalidates its approval.

To exercise stop events without any mailbox, use a synthetic event explicitly
marked `--test-only`:

```sh
python3 -m rsei.outreach inbound --db /tmp/spark-outreach-demo.sqlite --company sparktech-demo --event-id fixture-reply-1 --email alex@example.invalid --kind reply --test-only
```

Supported fixture kinds are `reply`, `bounce`, and `unsubscribe`; replaying the
same event ID is ignored. Replies stop later steps. Bounce and unsubscribe
events create a company-local suppression and stop later steps. No webhook,
mailbox polling, or inbound receiver is installed.

## Company setup and data boundaries

The source package is `sparktech-rsei` version `0.1.0`, rooted at `rsei/` in
this repository. A package scaffold and console entry points are in
`pyproject.toml`, but this version has not been built, published, or installed
from an index. Until SparkTech establishes a private package registry or an
approved pinned Git source, use a checkout in the company's own runtime and
pin the exact reviewed commit there. Each company must own its configuration,
adapters, auth permissions and local database; do not point multiple companies
at a shared prospect database. The synthetic consumer example is
`integrations/synthetic_company/`; it does not modify another company's repo.

The database is created with private file permissions and refuses to overlay
an unrelated existing SQLite file. Company IDs scope every query, and foreign
keys prevent cross-company campaign/source/prospect references. For stronger
tenant separation, use one OS account/runtime and one database file per
company. Do not place real prospect data in the included fixture.

To create a local company database, then add company-owned inputs:

```sh
python3 -m rsei.outreach init --db /private/company/outreach.sqlite --company acme --name 'Acme' --sender 'reviewed-sender@example.com' --timezone America/New_York --daily-cap 3 --brand sparktech
python3 -m rsei.outreach icp-add --db /private/company/outreach.sqlite --company acme --icp-id local-publishers --name 'Local publishers' --signal small_team --problem 'keeping publisher pages current'
python3 -m rsei.outreach source-add --db /private/company/outreach.sqlite --company acme --source-id offer-note --origin 'local://company/offer' --fact 'Company-approved, substantiated offer text.' --reviewer owner
```

Then add only an authorized prospect and a campaign whose step JSON follows
`integrations/synthetic_company/company.json`; review the queue, draft, approve
the exact campaign and each exact draft, then schedule. Configure the local
database path outside the source checkout and keep backups under the company's
own data controls. There is no shared private-data store or automatic import.

## Workflow glossary

- **API**: a defined interface that lets software request an operation. The
  `OutreachStore` methods and CLI are local interfaces; there is no live email
  API connection in this MVP.
- **Queue / job**: a durable SQLite record waiting for its due time and all
  policy checks.
- **Worker**: the process that claims due jobs and asks the configured adapter
  to deliver. Here the worker is manually invoked and only the mock adapter is
  configured; no daemon/service or unattended scheduler is installed.
- **Scheduler**: something that starts the worker periodically. No OS
  scheduler is configured by this package.
- **Transaction**: a group of database changes committed together, or rolled
  back together on error. Job claims and inbound fixture handling use SQLite
  transactions.
- **Idempotency key**: a stable key per company/campaign/prospect/step so that
  retry or reconciliation cannot create a second mock delivery for the same
  step.
- **Suppression**: a company-scoped stop record preventing a bounced or
  unsubscribed address from being enrolled or sent future messages.
- **Webhook**: an HTTP callback from an email provider when a mailbox event
  occurs. No inbound HTTP receiver or webhook subscription is implemented;
  `inbound --test-only` is a local test fixture interface only.
- **OAuth**: a delegated authorization flow that issues scoped access tokens.
  No token acquisition, token storage, or credential is included here.

## Provider route: Microsoft 365 and GoDaddy

The user confirmed that `spencer@sparktechstudio.com` is a Microsoft 365
mailbox, reached through the GoDaddy Microsoft 365 sign-in flow. Thus the route
for this sender is Microsoft Graph in the Microsoft 365 tenant; GoDaddy is the
account/reseller route, not a separate provider API for this mailbox.

`rsei.graph_mail.MicrosoftGraphMailAdapter` now has the real fixed HTTPS
`/me/sendMail` transport, an injected delegated token-provider interface,
company/sender/recipient/category/cap/expiry policy checks, HTML or text
payload preparation, and a testable transport interface. It is **disabled by
default** in this repo: there is no token provider or approved policy, and the
CLI always uses the local mock. Company databases are hard-disabled for live
sending. The least-privileged delegated permission for sending as the
signed-in mailbox is `Mail.Send`. Microsoft returns `202 Accepted` with no body;
that means accepted for processing, not final delivery. [Microsoft Graph
sendMail reference](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0)

### Exact setup still required from the mailbox owner/admin

1. Confirm the Microsoft Entra tenant ID for the verified M365 mailbox and
   register or approve a **single-tenant public client** owned by SparkTech.
   Configure the chosen interactive desktop flow (for example, auth code with
   PKCE and a registered local redirect URI supported by the selected identity
   library).
2. Grant delegated `Mail.Send` only for the controlled pilot. The user signs in
   as `spencer@sparktechstudio.com`; use tenant consent policy, with an admin
   granting consent if required by that organization. Do not grant application
   `Mail.Send` or mailbox read access for the first send.
3. Provide client ID and tenant ID to the company-owned token-provider setup
   through its secure configuration path. Do not paste access/refresh tokens
   into source, CLI output, chat, or this repository. Interactive sign-in can
   obtain a short-lived access token; unattended refresh-token storage needs a
   separate approved secure token vault decision. No refresh-token cache is
   implemented here.
4. Only after that, configure an expiring exact send policy for company
   `sparktech`, sender `spencer@sparktechstudio.com`, sole pilot recipient
   `shoberman@icloud.com`, message category `test`, and a cap of one. Review the
   final subject/body and theme at send time. The code's live flag remains false
   until the owner explicitly configures the approved credential provider and
   policy; no canary has been sent by this code.

### Status and uncertain-send reconciliation

The adapter returns `accepted_unconfirmed_delivery` for HTTP 202 and never
labels that as delivered. A non-202 response is a provider failure with its
status and optional Retry-After; a transport timeout is
`AmbiguousGraphDelivery`, because the request may have reached Exchange. The
message includes a stable SparkTech idempotency header, but Graph `sendMail`
does not return a message ID or give this adapter a safe exactly-once retry.
Therefore an ambiguous send stays held. Reconcile against the authenticated
mailbox's Sent Items using the stable header plus recipient/subject/time; record
the evidence and a human's decision. Found means sent; confirmed absent still
requires an explicit human retry decision; inconclusive stays held. No automatic
retry is allowed. Only a named human may queue a retry after explicitly
attesting not-sent and recording a local evidence reference, using
`retry-ambiguous --reviewer ... --evidence-ref ... --confirm-not-sent`; the
same idempotency key is reused. Automated Sent Items lookup is not wired: it
would require additional delegated mailbox-read access and an owner-approved
scope.

The first single-recipient canary still requires those owner/admin OAuth and
policy setup actions plus a final review. For future replies/bounces/unsubscribes,
implement and secure a company-owned receiver, verify provider event
authenticity, renew subscriptions if required, and prove replay/suppression.
Automated inbound processing may require separately reviewed delegated
mailbox-read scope. Keep send approval and inbound-event handling separate.
No account, tenant, OAuth grant, credential or permission was modified in this
task.

## Test evidence and baseline

Baseline is the synthetic fixture state before approvals: 1 company, 1 ICP,
1 source, 1 prospect, 1 two-step campaign, 2 drafted messages, 0 approvals,
0 jobs, and 0 sent rows. Tests assert state transitions and counts rather than
inventing conversion or business-impact rates. Test scenarios include a
missing/denied approval (job stopped, zero outbox records), partial sequence
(one step approved, later step does not queue), approval hash invalidation,
repeated scheduling/event ingestion, failure before and after mock provider
acceptance with reconciliation, suppression, caps, time windows, process
restart, and concurrent job claim. These are local tests, not deliverability
or live-integration metrics.

Run targeted tests from the package directory:

```sh
python3 -m unittest discover -s tests -p 'test_outreach.py' -v
python3 -m unittest discover -s tests -p 'test_graph_mail.py' -v
```

Live status remains disabled until the mailbox owner/admin completes the
Microsoft 365 app registration/consent and the company installs its secure
injected token provider and exact live policy. No credential should be added
to the sample configuration or repository. See
[`EMAIL-CANARY-STATUS.md`](EMAIL-CANARY-STATUS.md) for the new deny-by-default
exact-message canary boundary, test-only identity/token/store adapters, and
remaining provider and storage decisions. It does not enable this outreach
database or make sending available.
