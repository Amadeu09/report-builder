# AI Usage Log

Report Builder — Footprint Mappa / Relats technical interview challenge.

This log records what was delegated to Claude (AI), what was decided by the human
developer, and which Claude Code features were used and why.

---

## Workflow

All the work ran inside **Claude Code** (the CLI), using a **spec-driven
approach**: the project specification (`CLAUDE.md`) was written by the human
developer before any feature code, and every implementation step was gated on an
explicit plan + approval cycle. Claude proposed a short plan; the developer
approved, amended, or rejected it before any code was written. This workflow is
itself the main AI-usage story — the AI acted as an implementation partner, not
as an autonomous agent.

---

## What the human designed and decided

- **Project scope** — OCF only (not PCF), Path A + Path C architecture, no Xano,
  no database.
- **The `reportSpec` / LLM-as-config-editor pattern** — the constraint that the
  LLM fills a validated JSON object rather than emitting HTML or data was a
  deliberate architectural decision made before any code was written.
- **Technology choices** — Next.js 16 App Router, Tailwind v4, TypeScript strict,
  zod at every boundary, Playwright for PDF.
- **Branding fidelity** — Relats orange (`#FF5710`) sourced from relats.com
  metadata; the decision to reconstruct the brand rather than guess.
- **The `CLAUDE.md` specification** — written by the human as a single source of
  truth before coding began. This doc is the primary signal of deliberate scoping.
- **Plan approval at every increment** — each of the 9 implementation increments
  (data layer, report sections, print route, PDF export, lib/spec, generate-spec
  route, client render, chat panel, PDF spec passthrough) was explicitly approved
  before implementation.
- **Corrections and amendments** — several key fixes were directed by the human:
  - Font variable naming collision (`--font-inter` vs `--font-report`) — human
    identified root cause.
  - Cover page break failure (flex container blocking paged-media propagation) —
    human diagnosed and directed the `@media print { body { display: block } }` fix.
  - `ReportSpecSchema.parse(DEFAULT_OPTIONS)` comment corrected from
    "compile-only" to "runtime" — human caught the inaccuracy.
  - System-prompt rule added: `cover` and `conclusions` always remain unless
    explicitly removed — human identified the gap before testing.
  - `currentSpec` must be sent with every `/api/generate-spec` call for relative
    edits to work — human specified this as a hard requirement.

---

## What was delegated to Claude

- **Boilerplate and scaffolding** — all file creation, import wiring, component
  structure.
- **zod schema authoring** — `OcfRow`, `ReportSpecSchema`, bidirectional type
  assertion pattern.
- **CSV parser and hierarchical model** — `buildDataset`, consistency checks,
  `resolveEntity`.
- **Report component tree** — all section components (`Cover`, `Intro`,
  `Methodology`, `GlobalResults`, `Scope`, `Conclusions`), chart components
  (`Donut`, `Bar`), shared components (`SectionHeader`, `KeyFigure`).
- **Print stylesheet** — `@page`, `break-after-page`, `break-inside-avoid`,
  `break-after-avoid` placements.
- **Playwright PDF route** — `export-pdf/route.ts`, `preferCSSPageSize`,
  `printBackground`.
- **`lib/spec/`** — `schema.ts`, `merge.ts`, `index.ts`.
- **`/api/generate-spec`** — Anthropic SDK tool-use call, forced `tool_choice`,
  validation chain (partial → merge → full), entity check.
- **`ReportBuilder` client component** — split layout, state management, fetch
  handler, suggested prompts, PDF export button.
- **Spec passthrough to print route** — query-param encoding, zod validation on
  the print page, POST body on the export endpoint.
- **Git setup** — staging, commit message, remote configuration.

---

## Claude Code features used

| Feature | Used? | Why |
|---|---|---|
| `CLAUDE.md` project spec | Yes | Single source of truth; loaded into every session automatically |
| Plan mode (propose → approve → implement) | Yes | Every increment; enforces deliberate scoping |
| `report-reviewer` subagent | Defined, available | For post-feature review; not invoked every turn to keep sessions lean |
| `pdf-researcher` subagent | Yes | Ran the PDF landscape research in an isolated context window; output is `docs/pdf-research.md` |
| `report-design` skill | Yes | Loaded automatically when working in `components/report/`; encodes Relats visual system |
| `claude-api` skill | Yes | Confirmed Haiku 4.5 model ID and `tool_choice` TypeScript syntax |
| Background agents / worktrees | No | Over-engineering for a solo one-week project — deliberately excluded |
| Multi-agent teams | No | Same reason |

---

## Summary

The AI accelerated implementation significantly — the full stack (data layer,
branded report, PDF export, NL spec editor) was built across several short focused sessions over a few days.
The human's contribution was the architecture, the constraints, the spec, and the
quality gates. The AI's contribution was turning those decisions into working code
quickly and correctly.
