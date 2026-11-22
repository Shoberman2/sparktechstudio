# Email canary: local approval foundation and live blockers

## Implemented locally

The one-message gate in `rsei/email_pilot.py` binds company, sender, one
recipient, category, subject and plain-text body to an expiring challenge. An
explicit local approval or denial can be recorded only against that challenge.
Approval creates a one-message policy but never sends mail. The Graph adapter
remains separately disabled and requires a verified delegated `Mail.Send`
token, action-time enablement and a durable attempt store.

`rsei/entra_review.py` contains a lazy MSAL public-client adapter for a
single-tenant Entra OIDC sign-in. It requests only `openid`, validates tenant,
issuer, audience, subject allowlist and expiry, and retains only a digest of the
ID token. The reviewer’s click is an application decision bound to the open
challenge; OIDC authenticates the reviewer but does not cryptographically sign
the click. The browser review in `rsei/canary_review_web.py` shows the exact sender,
recipient, category, subject, plain-text body, content hash, expiry and one-send
limit. The server binds only to `127.0.0.1`, uses a short-lived random launch
URL, an HttpOnly/SameSite cookie, CSRF and exact Origin/Host checks, CSP, and
no-store responses. Approve/deny require an acknowledgement recorded by the
server, then invoke the existing MSAL identity adapter. Exact challenge and
message hashes, expiry and terminal state are checked server-side. Cancel
terminally cancels without identity approval; a closed tab leaves the challenge
open to reopen, while decided or cancelled challenges reopen read-only. The
server has no send endpoint and the CLI forces sending disabled.

`rsei/sqlite_canary_store.py` provides atomic unique approval/send claims and
durable outcomes at an explicitly supplied local database path. It uses SQLite
WAL and mode 0600 for the database file. The MSAL package is an optional
`entra` extra. No production path or database has been provisioned.

For local use after an authorized Entra app and reviewer subject are configured,
`spark-email-review` accepts one explicit draft and SQLite path, then serves the
view on a random loopback port. Example:

```sh
spark-email-review --company-id sparktech --sender sender@example.com \
  --recipient reviewer@example.com --category test --subject "Exact subject" \
  --body-file ./draft.txt --tenant-id TENANT_ID --client-id APP_ID \
  --reviewer-subject OIDC_SUB --attempt-db ./private/canary-attempts.sqlite \
  --open-browser
```

The launch URL is a local capability; keep it private and stop the process when
the review is complete. This command records only a decision; it cannot send.

## Verification boundary

The Entra adapter and SQLite path have synthetic/mock tests only. MSAL is not
installed in this environment, and no interactive sign-in was attempted. The
SQLite tests use temporary files and synthetic data. The browser page was
launched and exercised on loopback with synthetic message and reviewer data,
including acknowledgement, approve, deny, cancel, repeated click and close/reopen.
The native Tk route is not required by this browser view. Existing Graph tests
use a mock transport. No mailbox token, app registration, OAuth grant, live
send, hosting or deployment exists.

## Smallest remaining live gates

1. An authorized tenant administrator creates/approves a single-tenant native
   Entra app registration and supplies tenant/client identifiers and redirect
   setup. Install the optional MSAL extra in the chosen local environment.
2. Identify and authorize the reviewer subject in that tenant. Confirm the
   issuer and audience configuration match the app registration.
3. Separately approve the sender mailbox identity and delegated `Mail.Send`
   access. The canary requires the exact sending mailbox principal. Choose an
   owner-approved local database path and backup/retention approach.
4. Review and confirm the exact final draft and recipient in the approval view.
   A separate action-time authorization is still required before any live send.
   Do not treat Graph HTTP 202 as proof of delivery. Any timeout/5xx is held
   ambiguous and cannot be retried automatically.

No app registration, permission grant, credential/token storage, external
message, Mail.Read, webhook, campaign, hosting, or production change was made.

## Tests

`tests/test_canary_integrations.py` covers missing Entra configuration, synthetic
OIDC claims, tenant/audience/reviewer rejection, durable claims across store
reopen, database file permissions, exact review content and approval binding,
acknowledgement, CSRF/origin rejection, challenge mismatch, approve/deny,
cancel/reopen, repeated click, and the absence of a send route.
`tests/test_email_pilot.py` continues to exercise challenge scope, denial,
replay, expiry, sender/token checks, duplicate-send prevention, ambiguous holds
and disabled-send behavior. These tests prove only local logic with test data.
