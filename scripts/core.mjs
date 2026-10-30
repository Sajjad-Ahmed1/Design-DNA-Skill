// SAJJAD Design DNA: independent quality, comparison and token-export utilities.
// Copyright (c) 2026 Sajjad Ahmed Ghwenim. MIT.
export const get = (obj, path) => path.split(".").reduce((v, k) => v && typeof v === "object" ? v[k] : undefined, obj);
export const isHex = (s) => typeof s === "string" && /^#[0-9a-f]{6}$/i.test(s);
export const normalizeHex = (s) => isHex(s) ? s.toUpperCase() : null;

export function srgb(hex) {
  if (!isHex(hex)) throw Error("Invalid hex color: " + String(hex));
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}
export function luminance(hex) {
  return srgb(hex).map((x) => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4)
    .reduce((sum, x, i) => sum + x * [.2126, .7152, .0722][i], 0);
}
export function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
export const pairs = (obj, prefix = "") => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [[prefix, obj]];
  return Object.entries(obj).flatMap(([key, value]) => pairs(value, prefix ? prefix + "." + key : key));
};
export const usefulColors = (dna) => {
  const c = get(dna, "design_system.color") || {};
  const out = {};
  for (const [key, value] of [
    ["primary", c.primary?.hex], ["secondary", c.secondary?.hex],
    ["accent", c.accent?.hex], ["background", c.surface?.background],
    ["card", c.surface?.card], ["elevated", c.surface?.elevated],
    ["success", c.semantic?.success], ["warning", c.semantic?.warning],
    ["error", c.semantic?.error], ["info", c.semantic?.info],
    ["text", get(dna, "sajjad_extensions.accessibility.text_color")]
  ]) if (isHex(value)) out[key] = normalizeHex(value);
  return out;
};
const issue = (severity, code, message) => ({ severity, code, message });
export function audit(dna) {
  const issues = [];
  if (!dna || typeof dna !== "object" || Array.isArray(dna)) {
    return { score: 0, passed: false, issues: [issue("error", "INPUT_INVALID", "Expected a Design DNA JSON object")], metrics: {} };
  }
  for (const k of ["meta", "design_system", "design_style", "visual_effects"]) {
    if (!dna[k] || typeof dna[k] !== "object") issues.push(issue("warning", "MISSING_" + k.toUpperCase(), k + " is missing"));
  }
  const c = usefulColors(dna);
  if (!c.background) issues.push(issue("error", "BACKGROUND_MISSING", "No valid 6-digit surface.background found"));
  if (!c.primary) issues.push(issue("warning", "PRIMARY_MISSING", "No valid primary.hex found"));
  if (!c.text) issues.push(issue("warning", "TEXT_UNVERIFIED", "Set sajjad_extensions.accessibility.text_color to enable contrast calculation"));
  const metrics = { colors: c, contrast: null, direction: get(dna, "sajjad_extensions.localization.direction") || "unknown" };
  if (c.text && c.background) {
    const ratio = contrast(c.text, c.background);
    const minimum = get(dna, "sajjad_extensions.accessibility.large_text") === true ? 3 : 4.5;
    metrics.contrast = { text: c.text, background: c.background, ratio: +ratio.toFixed(2), minimum };
    if (ratio < minimum) issues.push(issue("error", "LOW_CONTRAST", "Text/background contrast " + ratio.toFixed(2) + ":1 is below " + minimum + ":1"));
  }
  const direction = metrics.direction;
  if (direction !== "ltr" && direction !== "rtl") issues.push(issue("warning", "DIRECTION_UNKNOWN", "Specify localization.direction (ltr or rtl)"));
  if (direction === "rtl") {
    const loc = get(dna, "sajjad_extensions.localization") || {};
    if (!Array.isArray(loc.languages) || !loc.languages.some((s) => /^ar\b/i.test(s))) {
      issues.push(issue("warning", "RTL_LANGUAGE", "RTL enabled but an Arabic language is not listed"));
    }
    if (loc.arabic_font_reviewed !== true) issues.push(issue("warning", "RTL_FONT", "Review Arabic font legibility and connected glyph shaping"));
    if (loc.directional_icons_reviewed !== true) issues.push(issue("warning", "RTL_ICONS", "Review directional icon mirroring (not all icons should be mirrored)"));
  }
  const effects = get(dna, "visual_effects.overview") || {};
  if (effects.performance_tier === "heavy" && !effects.fallback_strategy) {
    issues.push(issue("warning", "EFFECTS_FALLBACK", "Heavy effects need low-end and reduced-motion fallbacks"));
  }
  if (get(dna, "design_system.motion.philosophy") !== "none" &&
      get(dna, "sajjad_extensions.motion_accessibility.reduced_motion_fallback") !== true) {
    issues.push(issue("warning", "REDUCED_MOTION", "Confirm prefers-reduced-motion fallback; screenshots cannot prove this"));
  }
  if (!Array.isArray(get(dna, "sajjad_extensions.evidence")) || get(dna, "sajjad_extensions.evidence").length === 0) {
    issues.push(issue("warning", "EVIDENCE_UNKNOWN", "Document measured vs inferred values in sajjad_extensions.evidence"));
  } else {
    for (const item of get(dna, "sajjad_extensions.evidence")) {
      if (typeof item.path !== "string" || typeof item.method !== "string") issues.push(issue("warning", "EVIDENCE_INCOMPLETE", "Evidence entries require path and method"));
      if (item.confidence !== undefined && (!Number.isFinite(item.confidence) || item.confidence < 0 || item.confidence > 1))
        issues.push(issue("error", "EVIDENCE_CONFIDENCE", "Confidence must be between 0 and 1"));
    }
  }
  if (!get(dna, "design_system.typography.font_families.body")) {
    issues.push(issue("warning", "FONT_UNKNOWN", "Document body font or mark unknown if screenshot-only"));
  }
  if (!get(dna, "design_system.spacing.scale")) issues.push(issue("warning", "SPACING_UNKNOWN", "Document a spacing scale or mark uncertainty"));
  const score = Math.max(0, 100 - issues.reduce((n, x) => n + (x.severity === "error" ? 20 : 5), 0));
  return { version: "sajjad-quality-v1", score, passed: !issues.some((x) => x.severity === "error"), metrics, issues,
    disclaimer: "Static DNA checks only; not a full WCAG audit, browser test or proof of exact screenshot geometry." };
}
function dtcgColor(hex) {
  return { "$type": "color", "$value": { colorSpace: "srgb", components: srgb(hex).map((n) => +n.toFixed(6)), alpha: 1 } };
}
function dim(value) {
  const m = typeof value === "number" ? [null, String(value), "px"] : (typeof value === "string" ? value.trim().match(/^(-?(?:\d+\.?\d*|\.\d+))(px|rem)$/) : null);
  return m ? { "$type": "dimension", "$value": { value: Number(m[1] || value), unit: m[2] || "px" } } : null;
}
function slug(s) { return s.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""); }
export function tokens(dna) {
  const colors = usefulColors(dna);
  const out = { "$description": "SAJJAD Design DNA — portable design tokens" };
  if (Object.keys(colors).length) out.color = Object.fromEntries(Object.entries(colors).map(([k, v]) => [k, dtcgColor(v)]));
  const spacing = get(dna, "design_system.spacing.scale");
  if (Array.isArray(spacing)) {
    const entries = spacing.map((v, i) => ["step-" + i, dim(v)]).filter(([, v]) => !!v);
    if (entries.length) out.spacing = Object.fromEntries(entries);
  }
  const radii = get(dna, "design_system.shape.border_radius") || {};
  const radius = Object.fromEntries(Object.entries(radii).map(([k, v]) => [slug(k), dim(v)]).filter(([, v]) => !!v));
  if (Object.keys(radius).length) out.radius = radius;
  const fonts = get(dna, "design_system.typography.font_families") || {};
  const families = Object.fromEntries(Object.entries(fonts).filter(([, v]) => typeof v === "string" && v.trim()).map(([k, v]) => [slug(k), { "$type": "fontFamily", "$value": v.trim() }]));
  if (Object.keys(families).length) out.font = families;
  return out;
}
export function css(dna) {
  const c = usefulColors(dna), lines = [":root {"];
  for (const [k, v] of Object.entries(c)) lines.push("  --sajjad-color-" + slug(k) + ": " + v + ";");
  const spacing = get(dna, "design_system.spacing.scale");
  if (Array.isArray(spacing)) spacing.forEach((v, i) => { if (dim(v)) lines.push("  --sajjad-space-" + i + ": " + (typeof v === "number" ? v + "px" : v) + ";"); });
  const radii = get(dna, "design_system.shape.border_radius") || {};
  for (const [k, v] of Object.entries(radii)) if (dim(v)) lines.push("  --sajjad-radius-" + slug(k) + ": " + (typeof v === "number" ? v + "px" : v) + ";");
  const fonts = get(dna, "design_system.typography.font_families") || {};
  for (const [k, v] of Object.entries(fonts)) if (typeof v === "string" && v.trim()) lines.push("  --sajjad-font-" + slug(k) + ": " + JSON.stringify(v.trim()) + ";");
  return lines.concat(["}", ""]).join("\n");
}
export function compare(before, after) {
  const paths = [
    "design_system.color.primary.hex", "design_system.color.secondary.hex",
    "design_system.color.accent.hex", "design_system.color.surface.background",
    "design_system.color.surface.card", "design_system.typography.font_families.heading",
    "design_system.typography.font_families.body", "design_system.spacing.base_unit",
    "design_system.layout.grid_system", "design_system.layout.max_content_width",
    "design_system.shape.border_radius.large", "design_system.motion.philosophy",
    "design_style.aesthetic.genre", "visual_effects.overview.performance_tier",
    "sajjad_extensions.localization.direction"
  ];
  const changes = paths.map((path) => ({ path, from: get(before, path) ?? null, to: get(after, path) ?? null }))
    .filter((x) => JSON.stringify(x.from) !== JSON.stringify(x.to));
  return { compared_fields: paths.length, changed_fields: changes.length, changes };
}
