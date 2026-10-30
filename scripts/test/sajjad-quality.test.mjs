import test from "node:test";
import assert from "node:assert/strict";
import { audit, contrast, compare, css, tokens } from "../core.mjs";
const original = {
  meta: { name: "Test" }, design_style: {}, visual_effects: {},
  design_system: { color: { primary: { hex: "#E66A3A" }, surface: { background: "#10121A" } },
    typography: { font_families: { body: "Inter" } },
    spacing: { scale: ["4px", "8px", "16px"] }, motion: { philosophy: "none" } },
  sajjad_extensions: { accessibility: { text_color: "#FFFFFF", large_text: false },
    localization: { direction: "rtl", languages: ["ar"], arabic_font_reviewed: true, directional_icons_reviewed: true },
    motion_accessibility: { reduced_motion_fallback: true },
    evidence: [{ path: "design_system.color.primary.hex", method: "pixel-measured", confidence: 1 }] }
};
test("contrast matches WCAG canonical black-white ratio", () => assert.equal(contrast("#000000", "#FFFFFF"), 21));
test("accessible sample passes serious quality gates", () => { const a = audit(original); assert.equal(a.passed, true); assert.equal(a.metrics.direction, "rtl"); });
test("low contrast is reported as an error", () => {
  const data = structuredClone(original); data.sajjad_extensions.accessibility.text_color = "#15161A";
  const a = audit(data); assert.equal(a.passed, false); assert.ok(a.issues.some((i) => i.code === "LOW_CONTRAST"));
});
test("missing RTL review produces warnings", () => {
  const data = structuredClone(original); data.sajjad_extensions.localization.directional_icons_reviewed = false;
  assert.ok(audit(data).issues.some((i) => i.code === "RTL_ICONS"));
});
test("invalid confidence is rejected", () => {
  const data = structuredClone(original); data.sajjad_extensions.evidence[0].confidence = 1.1;
  assert.ok(audit(data).issues.some((i) => i.code === "EVIDENCE_CONFIDENCE"));
});
test("CSS export includes semantic values", () => {
  assert.match(css(original), /--sajjad-color-primary: #E66A3A;/);
  assert.match(css(original), /--sajjad-space-1: 8px;/);
});
test("DTCG uses typed sRGB tokens, not plain hex strings", () => {
  const t = tokens(original); assert.equal(t.color.primary.$type, "color");
  assert.equal(t.color.primary.$value.colorSpace, "srgb");
  assert.equal(t.spacing["step-2"].$value.value, 16);
});
test("change comparison detects a meaningful drift", () => {
  const next = structuredClone(original); next.design_system.color.primary.hex = "#123456";
  const result = compare(original, next);
  assert.equal(result.changed_fields, 1);
  assert.equal(result.changes[0].path, "design_system.color.primary.hex");
});
test("untrusted input is handled without a crash", () => {
  assert.equal(audit(null).passed, false);
});
