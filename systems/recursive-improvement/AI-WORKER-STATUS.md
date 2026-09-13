# Real AI worker integration: implemented, execution blocked

The existing `adapters/codex_worker.py` now supports an explicit user-local Codex authentication mode for `sparktech-fixture` only. The default company API-key requirement remains. It uses the documented CLI authentication lookup; no credential file is read or copied by this implementation. The installed `codex login status` reported a ChatGPT login, and `codex exec --help` states that `--ignore-user-config` skips configuration while authentication still uses CODEX_HOME. [Official authentication documentation](https://learn.chatgpt.com/docs/auth) and [noninteractive documentation](https://learn.chatgpt.com/docs/non-interactive-mode) were consulted.

`finish_local.py --codex-auth-home <configured-directory>` prepares the existing isolated counter workflow with one model invocation, a 120-second command timeout and a 180-second cycle budget. It records worker mode and reported model token usage separately. These time limits are not hard token or dollar caps. The prompt excludes raw company context, prior conversations and lessons; those remain local audit evidence. Independent tests and release checks still control local retention. No deterministic fallback occurs in model mode.

Two attempts were stopped **before execution** by automatic approval review. The first identified potential private repository/context export. The user then approved sending only the fixture, failure and repair instructions to OpenAI Codex via the existing login. The second review found that workspace-write coding-agent access could still read other repository content despite the narrowed prompt. No model patch, AI token usage or AI-produced release is claimed. The successful deterministic proof remains unchanged historical evidence.

Do not retry this command by disabling controls or broadening filesystem access. Installed CLI help did not establish an all-tools-disabled inference mode; disabling shell alone is insufficient. The narrow approved-payload alternative is a tool-free structured patch generator with a separately approved Spark credential or provider endpoint. A broader coding-agent access grant would need its own specific scope review and is not assumed here.

## Concrete separately reviewable next work

| Work packet | Inputs and implementation | Acceptance evidence |
|---|---|---|
| Tool-free model patch adapter | Approved Spark model API credential/endpoint; send only bounded fixture text and failure; require JSON file replacements, validate paths/size and apply locally | Actual model response, usage/receipt, generated diff, independent tests, local release measurement and ledger lesson; no credential or company-data mixing |
| Isolated execution boundary | Choose a dedicated container/VM or OS identity; read-only verification mount, scratch candidate mount, explicit egress and secret broker | Adversarial tests deny access to unrelated repo/home and deny out-of-scope writes/egress; quotas and cleanup verified |
| Company activation adapter | Named company's actual target, source inventory, owner, read-only observation/test commands, exact release mechanism and rollback contract | Controlled end-to-end production receipts under a separate bounded release approval; no generic deploy grant |
| Metering and cancellation | Company provider budget plus model request/usage ledger and idempotency, no hidden retries | Measured usage and enforced provider spending policy; timeout/unknown-outcome reconciliation |
| Value evidence activation | Owner-supplied production aggregates and source queries, test exclusions, consent and provider receipts, mature cohorts | Existing `value-metrics` validation plus private source audit; no login-count or fixture proxy |

Latest UTern context: Connections intake, fit, permissions, introduction approvals/status, replies and meetings belong in Bob chat, reusing existing backend state. A standalone Connections page is not the intended product. UTern production changes/releases remain with its owner; the independently scoped entry migration has its own checkout and review.
