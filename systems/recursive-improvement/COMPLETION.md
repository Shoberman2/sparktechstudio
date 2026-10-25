# Bounded Spark loop completed

The fresh September 13 [execution report](examples/completed-local-loop-20260913/REPORT.md) records real isolated Chromium observation, reproduced diagnosis, deterministic candidate repair, independent tests, local release, actual released measurement, a healthy next cycle, retain decision and a source-backed knowledge-ledger outcome/private lesson. It uses the existing runner, context reconciler, role identities and ledger. It preserves the customer-value contract's distinction between fixture evidence and production cohorts.

Measured one-click output: 2 → 1 → released 1 → next-cycle 1. Seven subprocess commands ran in 5.112 seconds; the original fixture stayed unchanged. Candidate digest: `78dea8c3c789aa613c417e97299bd092cb452b48d8fae8cffa87f7c0ee3437a1`. All 75 recorded artifact hashes verified. Screenshots and Chromium traces are retained, not simulated. No model was invoked and no user browser session or UTern endpoint was touched.

The remaining local integration gaps were a fresh durable release-and-follow-up proof connecting current context and identities to a measured knowledge outcome, and context revalidation in the runner before probes, implementation and release. `finish_local.py` closes the proof; runner context guards close the execution gap for supplied context records. Legacy standalone fixtures remain supported. The proof records local execution authorization separately from proposal review and keeps disclosure approval false.

Validation after the changes: 44 runner/pilot/context/value tests and 27 knowledge tests pass. These include release-pointer restoration and fresh post-rollback verification. The successful fresh loop retained its candidate; it did not need or pretend to execute a rollback.

## Reproduce

From this directory, with the documented Playwright runtime/cache installed:

```sh
python3 finish_local.py --output /absolute/path/to/new-proof-directory
```

The output directory must not already exist. Chromium uses a fresh headless process and loopback-only server. `RSEI_PLAYWRIGHT_MODULE` and `PLAYWRIGHT_BROWSERS_PATH` can point at existing installations as documented in DEMONSTRATION.md. The worker is the existing deterministic fixture repair, not an AI substitute. No public deploy adapter is provided.

## What remains live

This completes the requested bounded local proof, not the full unattended enterprise product. Live work still needs company-scoped model credentials and spending controls, isolation suitable for untrusted workloads, reviewed company adapters, explicit bounded release ownership, and actual production verification. UTern authenticated/core journeys, authorized participants, skill/consent evidence, delivery/reply/calendar receipts and separate human-final-submit Apply proof remain with its owner. Governed, mature cohorts are required for value or retention claims. Neither a fixed fixture nor shipped features establishes them.

[Connections status](pilot/CONNECTIONS-STATUS.md) preserves implemented/API versus live/browser/provider distinctions. [Value measurement](pilot/VALUE-MEASUREMENT.md) defines production evidence and remaining baseline gaps. [Release updates](pilot/release-updates.json) contains bounded owner-reported UTern deployment history; it is separate from the local runner's release pointer.
