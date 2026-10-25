# Knowledge-to-QA local integration

The ledger and runner are connected for **one controlled counter fixture**. Source text is authored locally, claims are prepared deterministically and reviewed through explicit fixture records, and the implementation worker performs a deterministic repair. Chromium interactions and measured before/after values are real. This demonstrates execution linkage, not AI extraction, AI repair, real podcast access or company revenue improvement.

```text
source span → claim → experiment → knowledge review
                                  ↓ still execution_authorized=false
                         separate execution approval
                                  ↓ validate current knowledge + exact scope
                         existing QA runner (candidate only)
                                  ↓ measured evidence + run/digest
                         outcome in the same company ledger
```

`qa_bridge.py` is an adapter, not a second scheduler or stage engine. It calls `rsei.runner.run_cycle`. The runner retains subprocess control, locks, isolated snapshots, budgets, regression tests and browser verification. The bridge always sets `release=False`; a reviewed experiment does not grant release rights.

## Demonstrate

From the repository root, with Playwright and an absolute browser cache configured as in the runner README:

```sh
python3 -m unittest discover -s systems/knowledge -v
cd systems/recursive-improvement
python3 -m unittest discover -s tests -v
cd ../..
python3 systems/knowledge/integrated_demo.py
```

The demo first attempts execution with only knowledge review and confirms rejection before any runner directory exists. It then explicitly records fixture execution approval, calls the real browser QA cycle, and records observed `2`, `2`, `1` for discovery, reproduction and verification. The candidate remains `awaiting_release`. There is no release pointer. This approval is a controlled demonstration record under the user's authorized fixture scope, not a claim that a real company's human review process occurred.

Outputs persist in `systems/knowledge/.integrated-runs/integrated-<id>/`: SQLite database, `summary.json`, `ledger-records.json` and complete runner evidence. The original authored fixture remains broken and unchanged. No foreground app/browser tab is controlled; Chromium runs headlessly.

The verified run `20260910T223601-375c5a3b0a` completed five commands in 3.132 seconds, retained an unreleased candidate, and linked outcome `bb6fbd7f-dab8-4cc2-8ed7-3b001ee9a894` to execution approval `21e3c1f7-f6cc-45d7-9ec3-07c5dd41e9a2`. The actual summary, ledger records, measurements, screenshots, traces, diff and hashes are saved in [examples/integrated-fixture](examples/integrated-fixture). Verification passed 27 knowledge/bridge tests and 20 runner tests. Fault tests use labeled test doubles; this saved integrated demonstration uses actual Chromium and subprocess execution.

## Separate approval operations

For an existing reviewed fixture proposal, run these as distinct trusted-operator actions, replacing the capitalized placeholders:

```sh
python3 systems/knowledge/qa_bridge.py approve \
  --db LEDGER_DB --company sparktech-fixture --proposal PROPOSAL_ID \
  --approve-execution --approved-by 'Execution reviewer' \
  --rationale 'One controlled candidate, no release or provider spend' \
  --expires-at FUTURE_ISO_TIMESTAMP_WITH_TIMEZONE

python3 systems/knowledge/qa_bridge.py execute \
  --db LEDGER_DB --company sparktech-fixture --proposal PROPOSAL_ID \
  --approval-id EXECUTION_APPROVAL_ID --state-root ABSOLUTE_RUN_DIRECTORY
```

Execution approval binds proposal, latest review, company, canonical config, source hashes, adapter/runner hashes, expiry, and candidate-only scope. It is claimed once in a short SQLite write transaction. Knowledge health and review are re-read at use time; a changed review requires a new execution approval even if it is also approved. Expired approval, superseded sources, stale/flagged claims, mismatched company, changed source/config/adapters and reused approvals are rejected before runner invocation. The runner checks the actual snapshot against the approved source manifest to catch a source change between authorization and copy.

The accepted goal, metric and success rule are the canonical counter experiment. An unrelated success measure cannot be marked supported by counter results. The bridge validates evidence-report hashes and reads actual counter measurements before reporting `supported`. Failed execution, unavailable measurements or changed review produce `inconclusive`; both preserve actual run and evidence references. `supported` means this fixture's stated correctness criterion was observed, never that a technique is universally effective. The underlying ledger's epistemic label remains `operator_reported_measurement`.

The execution approval, attempt, runner outcome, and execution-result records are linked by IDs. Outcome stores `run_id`, `candidate_digest`, `evidence_uri`, and `execution_approval_id`. Approval is not silently reusable after failure or interruption. If the host stops between runner execution and outcome recording, inspect the recorded attempt's state root and recover the runner as documented; reconcile its outcome explicitly through the ledger API. No automatic retry or side-effect replay is performed.

## Remaining boundaries

This CLI uses local reviewer attestations and trusted files, not authenticated human identities, tamper-proof records or hostile-tenant isolation. A review revoked after execution starts cannot cancel every already-running subprocess; the bridge does not release the candidate and rechecks review before classifying its outcome. It is not a transactional distributed approval service.

Each real pilot still needs selected authorized sources, an owner and measurable objective, a dedicated company environment, scoped credentials and budgets, a reviewed QA adapter and experiment mapping, and an explicit release/rollback process. The optional Codex and Claude workers remain separate and need a company-scoped credential; this bridge intentionally cannot activate them. General source ingestion remains useful without model credentials. No recurring collection or execution has been scheduled.
