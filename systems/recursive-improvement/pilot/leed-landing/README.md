# LEED landing-page builder pilot

This pilot uses SparkTech's `rsei.site_builder` workflow to generate a standalone, local landing-page preview from a company config and a reusable versioned template. It is a reusable builder with a LEED config, not a hand-authored one-off page. Generation is deterministic HTML/CSS templating; no model API is configured or called.

## Product grounding

The only LEED material found in this task is the local June `leed-media-design` handoff, principally `project/app/page.tsx` and `project/app/lede-landing.css` under `/Users/shoberman/Downloads/leed-media-design`. Its page code describes structured audience intake, concise briefs, beat/geography matching, contact preferences and source-safety flags. The matching factors and contact preferences are product-design statements, not connected or verified application behaviors. The handoff has no accessible Git repository, package manifest, signup service, or service adapter. The design text did not substantiate related-tip clustering, so the preview omits that claim. The sign-in route `/desk` has no available application checkout.

The included desk screenshot is from the local design handoff. It contains illustrative anonymous/sample tip text and is visibly captioned as synthetic. Do not treat it as real reporting, a live queue, or evidence of product behavior. The file keeps its actual JPEG format and is locally bundled with the generated preview.

## Run the workflow

From `systems/recursive-improvement`:

```sh
PYTHONPATH=. python3 -m rsei.site_builder run \
  --config pilot/leed-landing/site.json \
  --run-id leed-local-review \
  --run-root pilot/leed-landing/runs
```

Each run writes a frozen config and asset, durable `status.json` and `events.jsonl`, generated `site/index.html`, `report.json`, and `RESULT.md`. Run IDs are never overwritten. The run stages are config/input validation, rendering, and independent output checks. A stage can run at most twice; recovery only resumes a recorded failure and verifies its frozen input hash before continuing:

```sh
PYTHONPATH=. python3 -m rsei.site_builder recover \
  --run-dir pilot/leed-landing/runs/leed-local-review
```

The hidden `--inject-failure-once` switch exists only to demonstrate an intentional local fault and recovery. It is not used in ordinary runs. No background service or recursive run loop exists.

## Inquiry and unavailable integrations

The page reuses the handoff's existing `mailto:hello@leed.media` inquiry target. Verification checks the link; the workflow never opens a mail client or sends a request. The local preview cannot verify delivery end to end. No form endpoint, signup flow, paid checkout, `/desk` sign-in, live tips, reporter directory, source-contact workflow, or model-backed brief generation was available. These are reported as unavailable rather than successful.

The template validates its content, contrast, local screenshot, section links, prototype disclosure, and non-sending inquiry link. It prohibits scripts and external resources, and its policy blocks network, model, publish, send, and billing actions. The generated page is local and static; SparkTech has not modified or published the live LEED website.

The Codex browser refused local `file://` navigation under its URL policy, so this task did not capture a browser-rendered screenshot. The output remains a complete static HTML artifact that can be opened locally; no local web server or alternate browser path was used.
