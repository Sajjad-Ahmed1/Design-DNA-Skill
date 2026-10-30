#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { css, tokens } from "./core.mjs";
const args = process.argv.slice(2);
if (!args[0] || args.includes("--help")) {
  console.log("Usage: node scripts/export-tokens.mjs dna.json --format css|dtcg [--out file]");
  process.exit(args[0] ? 0 : 1);
}
try {
  const dna = JSON.parse(readFileSync(args[0], "utf8"));
  const fi = args.indexOf("--format");
  const format = fi >= 0 ? args[fi + 1] : "css";
  if (!["css", "dtcg"].includes(format)) throw Error("format must be css or dtcg");
  const text = format === "dtcg" ? JSON.stringify(tokens(dna), null, 2) + "\n" : css(dna);
  const oi = args.indexOf("--out");
  if (oi >= 0) {
    if (!args[oi + 1]) throw Error("Missing path after --out");
    writeFileSync(args[oi + 1], text);
    console.log("Export written: " + args[oi + 1]);
  } else console.log(text);
} catch (e) { console.error("Export failed: " + e.message); process.exitCode = 1; }
