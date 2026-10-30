#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { compare } from "./core.mjs";
const args = process.argv.slice(2);
if (args.length < 2) { console.error("Usage: node scripts/compare-dna.mjs before.json after.json"); process.exit(1); }
try {
  const result = compare(JSON.parse(readFileSync(args[0], "utf8")), JSON.parse(readFileSync(args[1], "utf8")));
  console.log(JSON.stringify(result, null, 2));
} catch (e) { console.error("Compare failed: " + e.message); process.exitCode = 1; }
