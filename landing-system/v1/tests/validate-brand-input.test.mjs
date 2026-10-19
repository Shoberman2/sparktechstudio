import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const validator = resolve(root, "tools/validate-brand-input.mjs");
const example = resolve(root, "fixtures/brand-input.example.json");

test("complete brand input passes local evidence validation", () => {
  const run = spawnSync(process.execPath, [validator, example], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /Brand input valid/);
});

test("unverified legal identity and unresolved local evidence fail", () => {
  const dir = mkdtempSync(resolve(tmpdir(), "landing-brand-"));
  try {
    const input = JSON.parse(readFileSync(example, "utf8"));
    input.footer.legalEntity = "Example Inc.";
    input.footer.legalEntityEvidence = null;
    input.features[0].evidence = ["missing-source.md"];
    const file = resolve(dir, "brand.json");
    writeFileSync(file, JSON.stringify(input));
    const run = spawnSync(process.execPath, [validator, file], { encoding: "utf8" });
    assert.equal(run.status, 1);
    assert.match(run.stderr, /legal entity requires verified evidence/);
    assert.match(run.stderr, /does not resolve locally/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
