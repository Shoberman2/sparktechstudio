#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ownDir = dirname(fileURLToPath(import.meta.url));
const schema = JSON.parse(readFileSync(resolve(ownDir, "../brand-input.schema.json"), "utf8"));
const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node tools/validate-brand-input.mjs path/to/brand-input.json");
  process.exit(2);
}

const errors = [];
let input;
try { input = JSON.parse(readFileSync(resolve(inputPath), "utf8")); }
catch (error) { console.error(`Cannot read brand input: ${error.message}`); process.exit(2); }

function validate(value, definition, path = "$", root = input) {
  if (definition.$ref) {
    const ref = definition.$ref.replace("#/$defs/", "");
    return validate(value, schema.$defs[ref], path, root);
  }
  if (definition.const !== undefined && value !== definition.const) errors.push(`${path} must equal ${definition.const}`);
  if (definition.type) {
    const types = Array.isArray(definition.type) ? definition.type : [definition.type];
    const actual = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
    if (!types.includes(actual)) { errors.push(`${path} must be ${types.join(" or ")}`); return; }
  }
  if (typeof value === "string") {
    if (definition.minLength && value.length < definition.minLength) errors.push(`${path} is shorter than ${definition.minLength} characters`);
    if (definition.pattern && !(new RegExp(definition.pattern).test(value))) errors.push(`${path} has an invalid format`);
  }
  if (Array.isArray(value)) {
    if (definition.minItems && value.length < definition.minItems) errors.push(`${path} needs at least ${definition.minItems} items`);
    if (definition.items) value.forEach((item, index) => validate(item, definition.items, `${path}[${index}]`, root));
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const required of definition.required ?? []) if (!(required in value)) errors.push(`${path}.${required} is required`);
    for (const [key, child] of Object.entries(value)) {
      const childDef = definition.properties?.[key] ?? definition.additionalProperties;
      if (!childDef) errors.push(`${path}.${key} is not allowed`);
      else if (childDef === true) continue;
      else validate(child, childDef, `${path}.${key}`, root);
    }
    if (definition.minProperties && Object.keys(value).length < definition.minProperties) errors.push(`${path} needs at least ${definition.minProperties} properties`);
  }
}

validate(input, schema);
const evidencePaths = [];
function collectEvidence(value, path = "$") {
  if (Array.isArray(value)) value.forEach((item, index) => collectEvidence(item, `${path}[${index}]`));
  else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (key === "evidence" && Array.isArray(child)) evidencePaths.push(...child.map((entry) => ({ entry, path: `${path}.evidence` })));
      else if (key === "path" && typeof child === "string") evidencePaths.push({ entry: child, path: `${path}.path`, isAsset: true });
      else if (key === "destinationEvidence" && typeof child === "string") evidencePaths.push({ entry: child, path: `${path}.destinationEvidence` });
      else if (key === "legalEntityEvidence" && typeof child === "string") evidencePaths.push({ entry: child, path: `${path}.legalEntityEvidence` });
      else collectEvidence(child, `${path}.${key}`);
    }
  }
}
collectEvidence(input);
const base = dirname(resolve(inputPath));
for (const item of evidencePaths) {
  if (!item.entry || /^https?:\/\//i.test(item.entry) || item.entry.startsWith("approved:")) continue;
  if (!existsSync(resolve(base, item.entry))) errors.push(`${item.path} does not resolve locally: ${item.entry}`);
}
if (input?.footer?.legalEntity && !input.footer.legalEntityEvidence) errors.push("footer legal entity requires verified evidence");
if (errors.length) {
  console.error(`Brand input failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Brand input valid: ${input.companyId}. ${evidencePaths.length} local evidence references checked.`);
