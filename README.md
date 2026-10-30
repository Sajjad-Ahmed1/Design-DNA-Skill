# SAJJAD Design DNA

**Extract → Audit → Export → Compare → Apply**

An enhanced, open-source agent skill for extracting design language from screenshots, images and accessible web pages, then auditing quality and creating original interfaces from reusable design tokens.

**Developed and maintained by Sajjad Ahmed Ghwenim** ([GitHub](https://github.com/Sajjad-Ahmed1)). Inspired by and partly incorporating the [original Design DNA project by zanwei](https://github.com/zanwei/design-dna), licensed under MIT. Upstream authors retain copyright to the original files. See [NOTICE.md](NOTICE.md) and [LICENSE](LICENSE).

[الشرح بالعربي](README.ar.md)

## What makes SAJJAD Design DNA different?

| Capability | Original Design DNA | SAJJAD extension |
| --- | --- | --- |
| Design system, style and visual effects extraction | Yes | Retained and expanded |
| Measured screenshot colors and palette verification | Yes | Retained (upstream scripts) |
| **WCAG contrast checks** | Not a dedicated CLI | **New: audit with measured ratios** |
| **Arabic and RTL design review** | Not a dedicated check | **New: localization-aware audit** |
| **Portable Design Tokens** | JSON DNA | **New: DTCG 2025.10 JSON and CSS export** |
| **Design drift comparison** | Not a dedicated CLI | **New: compare reference profiles** |
| **Shareable local HTML report** | Not a dedicated CLI | **New: offline report generator** |
| **Evidence and confidence** | Mixed inferred/measured | **New: explicit source-quality warnings** |
| **Test coverage** | Palette script tests | **New: quality pipeline tests + CI** |

These are specific additions, **not a claim that the entire project or all upstream code was authored here**. Screenshot-only geometry, font identity and motion are *estimates* until verified from a live DOM or source.

## Install in Codex

Prerequisites: Node.js 20+ and npm. Review the repository before installing third-party agent skills.

~~~powershell
npx skills add Sajjad-Ahmed1/Design-DNA-Skill -a codex -g
npx skills list -g
~~~

Or clone the repository and install locally:

~~~powershell
git clone https://github.com/Sajjad-Ahmed1/Design-DNA-Skill.git
cd Design-DNA-Skill
npm install --prefix scripts
npm test
~~~

The core audit, export, comparison and report tools only require Node.js; the **optional image color measurement** uses the original upstream dependency (Sharp), installed by the command above.

## Commands

From the repository root:

~~~bash
# Evaluate palette contrast, consistency, RTL and motion-related warnings
node scripts/audit.mjs examples/sample-dna.json --out quality-report.json

# Generate CSS variables for a new project
node scripts/export-tokens.mjs examples/sample-dna.json --format css --out design-tokens.css

# Generate Design Tokens Community Group (DTCG 2025.10) JSON
node scripts/export-tokens.mjs examples/sample-dna.json --format dtcg --out tokens.json

# Compare two Design DNA profiles (reference vs current)
node scripts/compare-dna.mjs examples/sample-dna.json examples/sample-dna.json

# Generate a standalone offline presentation of the palette and warnings
node scripts/report.mjs examples/sample-dna.json --out design-report.html

# OPTIONAL: measure exact dominant palette of a screenshot
node scripts/measure-colors.mjs screenshot.png > measured-colors.json

# OPTIONAL: verify a resulting screenshot against saved colors
node scripts/verify.mjs implementation.png measured-colors.json
~~~

## Workflow

1. **Capture.** Provide a screenshot, image, or webpage. If a webpage cannot be browsed, request a screenshot; never pretend it was inspected.
2. **Extract.** Measure screenshot colors with the included scripts (when available). For geometry, typography, motion and visual effects, mark unverified claims as estimates.
3. **Enrich.** Produce the three original dimensions: design system, qualitative style, and visual effects. Add optional SAJJAD extensions: text color, direction, evidence and accessibility review.
4. **Audit.** Run the quality check and correct high-contrast errors; do not claim a full WCAG certification based on screenshots.
5. **Export.** Generate CSS variables or DTCG tokens to move styles into a new project.
6. **Create.** Build an *original* page matching the visual principles, not the original brand, content, layout or protected imagery.
7. **Compare.** Check variation using the compare tool, verify measured colors with the upstream verifier, and iterate.

## Tested / not tested

Automated checks cover the new CLI features and the upstream palette measurement tests. Visual fidelity, layout accessibility, browser behavior and full responsive correctness still require manual and browser testing. CI is configured in [.github/workflows/test.yml](.github/workflows/test.yml).

## License and attribution

MIT. Copyright for **new SAJJAD code and documentation** belongs to its contributors; reused upstream material remains copyright its original authors. See [NOTICE.md](NOTICE.md).

**Created for designers who want to understand a design's language—not clone a website.**
