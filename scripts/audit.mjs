#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { audit } from "./core.mjs";
const args = process.argv.slice(2);
if (!args[0] || args.includes("--help")) {
  console.log("Usage: node scripts/audit.mjs profile.json [--out report.json] [--strict]");
  process.exit(args[0] ? 0 : 1);
}
try {
  const result = audit(JSON.parse(readFileSync(args[0], "utf8")));
  const json = JSON.stringify(result, null, 2) + "\n";
  const oi = args.indexOf("--out");
  if (oi >= 0) {
    if (!args[oi + 1]) throw Error("Missing path after --out");
    writeFileSync(args[oi + 1], json);
    console.log("Report written: " + args[oi + 1]);
  } else console.log(json);
  if (args.includes("--strict") && !result.passed) process.exitCode = 2;
} catch (e) { console.error("Audit failed: " + e.message); process.exitCode = 1; }
