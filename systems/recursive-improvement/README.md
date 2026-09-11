# Recursive Self-Enterprise Improvement

SparkTech's first reusable system is an executable QA improvement cycle. It launches a real browser probe, reproduces a finding, invokes an implementation subprocess against an isolated snapshot, checks the resulting changes, runs independent tests and browser verification, and optionally switches a company-local release pointer. A browser checks that released artifact. Failure restores the previous pointer. Evidence and lessons feed the next cycle.

This is a local execution foundation, not an unattended production service. The included browser fixture and deterministic repair are real executions against deliberately broken code. The deterministic worker is explicitly **not an AI agent**. An optional real Codex worker adapter is included; live model execution requires separately provisioned company credentials and has not been demonstrated here. No outside company is connected.

## Run it

Requires Python 3.10+, Node 20+, Git only for reviewing the resulting code, and macOS/Linux (the lock and process-group implementation is POSIX). Work from this directory:

```sh
npm install --ignore-scripts
export PLAYWRIGHT_BROWSERS_PATH="$PWD/.browser-cache"
npx playwright install chromium
python3 -m unittest discover -s tests -v
python3 -m rsei.runner run --release-local
python3 -m rsei.runner run --from-current
python3 -m rsei.runner status
```

`python3 demo.py` runs the repair and follow-up together and asserts their real observations and unchanged source.

Set `PLAYWRIGHT_BROWSERS_PATH` to the absolute browser installation location **before** installing/running. The adapter uses a private HOME, so the usual user-home browser cache is not implicitly available. On a Codex desktop with bundled Playwright, set `RSEI_PLAYWRIGHT_MODULE` to its absolute `playwright/index.js` path instead of installing the npm dependency, and use the existing absolute browser cache path. The demonstrated runtime used Playwright 1.62.1. A restricted host must permit Chromium and loopback sockets. No public listener is opened.

The first command with `--release-local` needs both that explicit flag and `permissions.local_release: true`. Without either, a verified change stops at `awaiting_release`, retaining its candidate, diff and evidence. This is a review boundary, not a production deploy approval token. There is intentionally no public deployment command and no command that resumes an old candidate into production.

`--from-current` verifies the company's release identity and content digest before using it as the next cycle's source. With the repaired fixture, this executes one real browser check and returns `healthy`. Without that flag, the deliberately broken original fixture is used again. Successful local release does not modify the original repository or commit changes.

## Execution and evidence

```text
discover → reproduce same fingerprint → implement isolated copy
         → check file allowlist and source drift → regression tests
         → browser verify → retained candidate
         → optional local release → browser release check → completed
                                                       ↘ rollback
```

Every run has a unique directory under `.runs/<company-id>/`. `status` can read atomic state while a run is active. A company lock prevents overlapping cycles and releases. A run stores:

| Artifact | Purpose |
| --- | --- |
| `config.json`, `task.json` | Effective company policy, goal, reproduced finding and recent same-company lessons |
| `status.json`, `events.jsonl` | Current state, command budget used, timestamped transition history |
| `source-manifest.json`, `baseline/`, `workspace/` | Original file hashes and separate repair workspace |
| `changes.patch`, `candidate/`, `candidate-manifest.json` | Reviewable change and verified artifact |
| `evidence/<stage>/command.json` | Actual argv, exit status and elapsed duration |
| `evidence/<stage>/stdout.txt`, `stderr.txt` | Subprocess output; explicitly injected credential values are redacted |
| `evidence/<browser-stage>/result.json`, `page.png`, `trace.zip` | Observed result, screenshot and Playwright trace |
| `evidence-manifest.json`, `lesson.json` | Evidence integrity hashes and outcome supplied to later repair tasks |

Browser exit 0 means pass, exit 10 means an observed finding, and any other exit means infrastructure failure. The report must agree with the exit code. Infrastructure failures never become bugs that the implementation worker tries to fix. Two probes must reproduce the same fingerprint before implementation starts. A successful worker exit alone proves nothing; independent verification must pass.

The included browser adapter is a counter-specific probe. It starts a loopback-only HTTP server, opens a fresh Chromium context, blocks requests outside that exact origin, clicks the button, reads the result, and captures evidence. It does not import user cookies, browse production or claim exploratory coverage beyond that interaction.

## Company configuration and adoption

`companies/fixture.json` is the only enabled example. `companies/adopters.json` is descriptive, grants no execution rights, and identifies LEED and Ballot Watch as intended adopters. UTern is independent, reference-only, and not owned by SparkTech. Its release and accounts are unaffected. X/LinkedIn setup remains paused pending the user's public naming decision.

A separate company configuration contains its own ID, display name, goal, source file inventory, editable file allowlist, commands, secret names, budgets and permissions. Company identity is attached to every task, result, release pointer and lesson. Nothing automatically copies branding, data, credentials or goals between companies. This foundation has no content-publishing or marketing adapter.

To connect a new workload, provide:

1. A reviewed, company-specific execution config with an explicit source inventory. Only listed regular files are copied. Dependencies must be available in the execution image or included deliberately; entire repositories and `.env` files are not copied automatically.
2. Trusted `probe`, `worker`, and `test` argv arrays. No shell command strings are evaluated by the runner. Commands receive `RSEI_WORKSPACE`, `RSEI_EVIDENCE`, `RSEI_TASK` and `RSEI_COMPANY_ID`. Absolute adapter files in argv are fingerprinted and checked after implementation.
3. A probe that writes `result.json` with `schema_version: 1`, `status: "passed" | "finding"`, a stable finding `fingerprint`, and paths to evidence under its evidence directory. Use a distinct exit code for service, browser or credential failure. Keep verification logic outside editable source.
4. An implementation worker that edits only its snapshot and exits nonzero on failure. A worker may return a blocker; it must not manufacture a successful implementation. The runner rejects empty changes and files outside the allowlist.
5. A test command whose exit status independently verifies the candidate. Source drift, changed verification inputs and mutated candidates stop promotion.

Configs and adapters are **trusted local code**. File snapshots, credential filtering and per-company directories prevent accidental mixing; they are not an OS security boundary against malicious same-user programs. Before accepting untrusted repositories or other companies' private data, execute each company in a dedicated container/VM or OS account, mount verification read-only, constrain egress, and use separate secret brokers. Do not expose this CLI as a multi-tenant API with user-supplied command arrays.

## Optional Codex implementation worker

Copy `companies/codex-fixture.example.json` to a local company config, set `enabled: true`, and provision the intended company-scoped `CODEX_API_KEY` through your secret manager. Do not paste keys into config, prompts or evidence. Set `environment.CODEX_EXECUTABLE` to the installed CLI's absolute path if `codex` is not on the runner's minimal PATH. Optionally set `environment.CODEX_MODEL` to the company's approved model. The example disables local release.

The adapter invokes `codex exec` with JSONL events, ephemeral execution, no inherited user config, the `workspace-write` sandbox, no approval escalation, and no inherited shell environment. It passes the actual reproduced finding and file allowlist to the model. It propagates the real exit status and never falls back to the deterministic repair. The outer runner records reported token usage when present and still requires its own tests and browser verification. This follows the supported [Codex noninteractive interface](https://learn.chatgpt.com/docs/non-interactive-mode).

The fresh worker HOME does not reuse desktop account authentication. Explicit secret names are passed only to the worker, never to browser probes or regression commands. The Codex adapter needs network access to its model provider and a working company credential. This host has a Codex executable, but no `CODEX_API_KEY` was available during implementation. Its CLI contract and missing-credential behavior are tested; a live model repair remains unverified.

## Budgets, recovery and limits

`max_commands`, `max_seconds`, `command_seconds`, and `max_output_bytes` bound top-level command count, cycle/command execution time, and retained stdout/stderr. Timeout and output overflow terminate the process group, including ordinary child processes. Output is sampled every 25 ms and truncated after execution; disk use can briefly exceed the output limit. Browser traces, snapshots and source size are not quota-limited. Hosted use needs filesystem quotas and retention policies.

These are execution limits, **not hard token or dollar caps**. Codex usage is reported after a turn; the runner cannot infer provider billing or guarantee cancellation of provider work when a local process stops. Use company-specific provider spending controls or a metered model gateway before funded unattended execution. No model retries, automatic budget increases or provider fallback are hidden in this runner.

After an unexpected host/process interruption:

```sh
python3 -m rsei.runner status
python3 -m rsei.runner recover
```

Recovery holds the company lock, refuses to proceed while a recorded command process group exists, restores an interrupted local release pointer when it still belongs to that run, and marks the run interrupted. It never blindly signals stored PIDs or replays side effects. Inspect any recorded orphan process before stopping it. Start a fresh cycle after recovery. Normal command errors and Ctrl-C perform cleanup immediately. Durable files use atomic replacement; this is process-interruption recovery, not a power-loss transactional database or tamper-proof audit service.

`lesson.json` records outcomes and evidence for the next implementation task. It does not autonomously rewrite permissions, promote suggestions into policy, or learn a new objective. The deterministic fixture repair ignores lessons; the real worker receives them as untrusted context. Future analytics experiments, maintenance, marketing and operations can use the same evidence/execution contracts after their own adapters, scopes and release controls exist. None are represented as live capabilities today.

## Knowledge-system integration boundary

The separate knowledge/intelligence workstream owns source ingestion, source-backed techniques, company applicability, reviewed experiment proposals and measured outcomes. This package owns QA execution. Knowledge records may reference `company_id`, `run_id`, `candidate_digest` and evidence paths from this runner; a reviewed QA proposal may supply a company-specific goal to a future adapter. A source recommendation or lesson does not itself authorize execution, change permissions or demonstrate an experiment's effect. The current QA stage machine is not a generic knowledge ingestion orchestrator.

## Grounding and verification

The read-only UTern reference reports separated QA discovery, isolated implementation, focused tests, hosted release checks and runtime activation. They also reported a case where code changes could not restore a provider with exhausted credits. That informed the explicit infrastructure-failure path and the distinction between verified code and live provider readiness. No UTern commands, accounts or releases were changed.

See `DEMONSTRATION.md` for the actual fixture run, saved browser artifacts, verification coverage and remaining activation requirements. All implementation lives under `systems/recursive-improvement/`; the marketing website is owned by a separate task.
