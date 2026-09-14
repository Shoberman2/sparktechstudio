# Real AI worker integration: Claude adapter implemented and tested, live run not performed

**Status on 2026-09-14.** The "tool-free model patch adapter" packet from the table below now exists as `adapters/claude_worker.py`, with `companies/claude-fixture.example.json` and `finish_local.py --claude`. It sits behind the unchanged runner boundary: the runner injects `ANTHROPIC_API_KEY` into the worker stage only, refuses to start the worker without it, checks the changed-file allowlist and adapter fingerprints afterward, and still requires independent tests and Chromium verification. The adapter makes one Messages API request with no tools and no shell, sends only the goal, the reproduced finding, the allowlist and the editable file text, and applies whole-file replacements after validating paths, duplicates and size. Model `claude-opus-5`, one explicit fallback to `claude-sonnet-5` on availability failures only, every attempt recorded in `evidence/implement/model-attempts.json`.

**Verified.** 50 runner tests pass, including five new ones that use a Messages API test double and a loopback server through the real subprocess cycle: no network call without the key, the bounded payload excludes accepted context and lessons, exactly one fallback and none on auth/billing/permission/bad-request errors, blockers/refusals/truncation/out-of-allowlist paths never touch the workspace, and the key is absent from stdout, `model-attempts.json` and the diff. The deterministic `finish_local.py` proof was re-run after the change and completed 2 → 1 → released 1 → next cycle 1 with the same candidate digest. Under the runner's minimal environment the system `python3` (3.9.6) completed TLS to `api.anthropic.com` and received a 401 with no key sent, so the transport works without installed packages.

**Not verified: no live Claude repair has run.** `ANTHROPIC_API_KEY` was not present in the shell that did this work, so `finish_local.py --claude` was invoked once, refused before creating any output, and no model was called. There is no measured model patch, token usage, or AI-produced candidate to report. The Codex worker remains in the state described below. The knowledge bridge (`systems/knowledge/qa_bridge.py`) is still bound to the zero-spend deterministic fixture config and cannot activate either model worker; that is intentional and unchanged.

To produce the missing measurement, provision a company-scoped key through the execution environment (not chat, not a file in this repository), then from this directory with the Playwright cache configured:

```sh
ANTHROPIC_API_KEY=... python3 finish_local.py --claude --output /absolute/path/to/new-proof-directory
```

Record `measurement.json` (`worker_kind`, `reported_model_usage`, observations) and `cycles/sparktech-fixture/<run>/evidence/implement/model-attempts.json` here afterward. The time limits are 120 seconds per command and 180 per cycle; they are not a dollar cap.

---

# Earlier record (2026-09-13): Codex worker implemented, execution blocked

The existing `adapters/codex_worker.py` now supports an explicit user-local Codex authentication mode for `sparktech-fixture` only. The default company API-key requirement remains. It uses the documented CLI authentication lookup; no credential file is read or copied by this implementation. The installed `codex login status` reported a ChatGPT login, and `codex exec --help` states that `--ignore-user-config` skips configuration while authentication still uses CODEX_HOME. [Official authentication documentation](https://learn.chatgpt.com/docs/auth) and [noninteractive documentation](https://learn.chatgpt.com/docs/non-interactive-mode) were consulted.

`finish_local.py --codex-auth-home <configured-directory>` prepares the existing isolated counter workflow with one model invocation, a 120-second command timeout and a 180-second cycle budget. It records worker mode and reported model token usage separately. These time limits are not hard token or dollar caps. The prompt excludes raw company context, prior conversations and lessons; those remain local audit evidence. Independent tests and release checks still control local retention. No deterministic fallback occurs in model mode.

Two attempts were stopped **before execution** by automatic approval review. The first identified potential private repository/context export. The user then approved sending only the fixture, failure and repair instructions to OpenAI Codex via the existing login. The second review found that workspace-write coding-agent access could still read other repository content despite the narrowed prompt. No model patch, AI token usage or AI-produced release is claimed. The successful deterministic proof remains unchanged historical evidence.

Do not retry this command by disabling controls or broadening filesystem access. Installed CLI help did not establish an all-tools-disabled inference mode; disabling shell alone is insufficient. The narrow approved-payload alternative is a tool-free structured patch generator with a separately approved Spark credential or provider endpoint. A broader coding-agent access grant would need its own specific scope review and is not assumed here.

## Concrete separately reviewable next work

| Work packet | Inputs and implementation | Acceptance evidence |
|---|---|---|
| Tool-free model patch adapter | **Implemented 2026-09-14 as `adapters/claude_worker.py`** (see top). Still needed: an approved company-scoped credential in the execution environment | Actual model response, usage/receipt, generated diff, independent tests, local release measurement and ledger lesson; no credential or company-data mixing. **Not yet produced** |
| Isolated execution boundary | Choose a dedicated container/VM or OS identity; read-only verification mount, scratch candidate mount, explicit egress and secret broker | Adversarial tests deny access to unrelated repo/home and deny out-of-scope writes/egress; quotas and cleanup verified |
| Company activation adapter | Named company's actual target, source inventory, owner, read-only observation/test commands, exact release mechanism and rollback contract | Controlled end-to-end production receipts under a separate bounded release approval; no generic deploy grant |
| Metering and cancellation | Company provider budget plus model request/usage ledger and idempotency, no hidden retries | Measured usage and enforced provider spending policy; timeout/unknown-outcome reconciliation |
| Value evidence activation | Owner-supplied production aggregates and source queries, test exclusions, consent and provider receipts, mature cohorts | Existing `value-metrics` validation plus private source audit; no login-count or fixture proxy |

Latest UTern context: Connections intake, fit, permissions, introduction approvals/status, replies and meetings belong in Bob chat, reusing existing backend state. A standalone Connections page is not the intended product. UTern production changes/releases remain with its owner; the independently scoped entry migration has its own checkout and review.
