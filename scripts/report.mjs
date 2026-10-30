#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { audit, usefulColors } from "./core.mjs";
const args = process.argv.slice(2);
if (!args[0]) { console.error("Usage: node scripts/report.mjs dna.json [--out report.html]"); process.exit(1); }
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
try {
  const dna = JSON.parse(readFileSync(args[0], "utf8")), result = audit(dna);
  const name = esc(dna.meta?.name || "Untitled Design DNA");
  const swatches = Object.entries(usefulColors(dna)).map(([key, value]) =>
    '<div class="sw"><div class="sample" style="background:' + esc(value) + '"></div><b>' + esc(key) + '</b><code>' + esc(value) + '</code></div>').join("");
  const issues = result.issues.map((v) =>
    '<li class="' + esc(v.severity) + '"><b>' + esc(v.code) + '</b> — ' + esc(v.message) + '</li>').join("");
  const ratio = result.metrics.contrast ? result.metrics.contrast.ratio + ":1" : "Not tested";
  const html = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SAJJAD DNA — ' + name + '</title>' +
    '<style>body{background:#0f1420;color:#f2f4f7;font:16px/1.6 system-ui;margin:0}main{max-width:980px;margin:auto;padding:32px 20px}h1{font-size:clamp(32px,6vw,60px);letter-spacing:-.04em;margin:8px 0}h2{margin-top:44px}.muted{color:#aeb8c8}.brand{color:#e66a3a;font-weight:800;letter-spacing:.12em}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px}.sw{padding:14px;border:1px solid #353e50;border-radius:14px;background:#1a2231;display:grid;gap:8px}.sample{height:92px;border-radius:8px;border:1px solid #536071}code{color:#dbe2e9}li{margin:8px 0;background:#1a2231;border:1px solid #353e50;padding:12px;border-radius:9px}.error{border-color:#e66a3a}.summary{display:flex;gap:22px;flex-wrap:wrap}.summary>div{padding:18px;border:1px solid #353e50;border-radius:14px;min-width:140px}</style>' +
    '<main><div class="brand">SAJJAD / DESIGN DNA</div><h1>' + name + '</h1><p class="muted">Offline quality overview · Values may include inferred estimates.</p>' +
    '<section class="summary"><div><b>Audit score</b><h2>' + result.score + '/100</h2></div><div><b>Text contrast</b><h2>' + esc(ratio) + '</h2></div><div><b>Direction</b><h2>' + esc(result.metrics.direction) + '</h2></div></section>' +
    '<h2>Colors</h2><section class="cards">' + swatches + '</section><h2>Quality findings</h2><ul>' + (issues || "<li>No findings from this limited static check.</li>") + '</ul>' +
    '<p class="muted">' + esc(result.disclaimer) + '</p><p class="brand">Developed by Sajjad Ahmed Ghwenim · Original upstream credits in NOTICE.md</p></main></html>';
  const oi = args.indexOf("--out");
  const out = oi >= 0 ? args[oi + 1] : "design-report.html";
  if (!out) throw Error("Missing path after --out");
  writeFileSync(out, html);
  console.log("Report written: " + out);
} catch (e) { console.error("Report failed: " + e.message); process.exitCode = 1; }
