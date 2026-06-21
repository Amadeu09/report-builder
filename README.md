# Report Builder — Relats OCF

A Next.js web app that generates a Relats-branded Organisational Carbon Footprint PDF report from a sample CSV, built as a technical interview challenge for **Footprint Mappa**.

**Live demo:**  https://report-builder-mappa.vercel.app/

---

## What I chose and why

**Domain: OCF, not PCF.** The sample data was already OCF-shaped (Scope 1/2/3 totals, fixed category registry, three plants). Building against real given data was the only sensible move; PCF would have required first modelling a product-level LCA dataset (functional units, part numbers, multi-site assembly) before any reporting could begin. OCF's bounded structure (one organisation, three scopes, a fixed category set) also fit the one-week timebox and the brief's preference for a small solution understood deeply over a large one impossible to defend.

**Path: A + C.** Path A (CSV → branded on-screen report → PDF export) ships as a standalone deliverable. Path C layers a natural-language editor on top: the user types a change in plain English → the server calls Claude with a constrained tool schema → a validated `reportSpec` JSON updates the renderer instantly. Both layers share one component tree and one data pipeline.

**The central design decision — LLM as config editor, not renderer.** The model only fills a constrained, zod-validated `reportSpec` object. It never emits HTML, layout, or data. This makes the AI interaction defensible (the contract is small and ours), secure (no XSS path), and cheap (the renderer does the work; Claude only edits a config).

**PDF: Playwright over react-pdf or paid APIs.** The report is already a faithful HTML/SVG artifact by the time the export runs. Playwright renders it with the same Chromium engine the browser uses — fidelity is automatic, not re-engineered. See [`docs/pdf-research.md`](docs/pdf-research.md) for the full landscape survey and build-vs-buy justification.

**TypeScript (typed JSX).** The brief lists JS/JSX; TypeScript is a strict superset that compiles to the same JS and keeps JSX components unchanged — so this is a conforming choice, not a deviation. The `OcfDataset` model and the `reportSpec` contract between the LLM and the renderer are the riskiest surfaces — external boundaries where a type error produces a wrong report or a runtime crash. Zod + TypeScript strict catches these at build time.

**No Xano, no database.** The CSV is a static asset; the `reportSpec` lives in React state. No persistence requirements exist. Next.js Route Handlers cover the two server-only operations (PDF generation, Claude API key proxying) with no extra infra.

---

## Time invested

Approximately **8–10 hours**, spread across several days in short focused sessions.

---

## How AI was used

Built inside **Claude Code** (the CLI). Workflow: write the full spec (`CLAUDE.md`) before any feature code; every increment is propose → approve → implement. Claude never wrote a line without an explicit human plan approval.

**Human designed and decided:**
- Architecture: the `reportSpec` / LLM-as-config-editor pattern; the hard constraint that the LLM fills a validated JSON object and never emits HTML.
- Scope: OCF only, Path A + C, no Xano, no database, TypeScript strict.
- Technology choices: Next.js 16 App Router, Tailwind v4 CSS-first config, Playwright for PDF.
- Branding: Relats orange (`#FF5710`) sourced from relats.com metadata; brand reconstruction without a provided kit.
- Quality gates: caught font variable collision, cover page-break failure, spec prompt gaps, and `currentSpec` passthrough requirement during testing.

**Claude implemented:**
- All file scaffolding and boilerplate; zod schemas; CSV parser and typed hierarchical model; report component tree and hand-rolled SVG charts; Playwright PDF route; `/api/generate-spec` (Anthropic SDK tool use with forced `tool_choice`); `ReportBuilder` client component and chat panel.

**Claude Code features used:** `CLAUDE.md` project spec, plan mode on every increment, `pdf-researcher` subagent (ran PDF landscape research in an isolated context window — output is `docs/pdf-research.md`), `report-design` skill (Relats visual system, loaded automatically when working in `components/report/`), `claude-api` skill (model ID and `tool_choice` TypeScript syntax). Deliberately skipped: background agents, worktrees, multi-agent teams — over-engineering for a solo one-week project.


---

## What I'd do with more time

- **Year-over-year comparison** — the sample report shows 2023 vs 2024; the current CSV is single-year only. With a second year this becomes the most compelling chart.
- **Rate-limiting + auth on `/api/generate-spec`** — cost protection for the Anthropic key in production.
- **Persistent spec history** — undo/redo in the chat panel; snapshot specs to URL params for shareable configs.
- **PDF accessibility** — tagged PDF/UA output; would reopen the Playwright vs. DocRaptor/Prince question.
- **User-uploaded CSV** — validate size/type at the boundary, same zod pipeline.

---

## Getting started

```bash
npm install
npx playwright install chromium   # one-time; required for PDF export
cp .env.local.example .env.local  # add ANTHROPIC_API_KEY
npm run dev
```

| Route | Description |
|---|---|
| `/` | Landing page |
| `/report/builder` | NL chat + live report preview + PDF export |
| `/report/preview` | Static report preview + PDF export |

```bash
npm run build   # must pass before deploy
npm run lint
```

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) — Server Components for data + render; Route Handlers for PDF + AI |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 — CSS-first `@theme` config |
| Components | shadcn/ui (new-york) + Radix UI + Lucide — copied into `components/ui/`, owned and edited |
| Validation | zod — CSV parsing + `reportSpec` contract |
| CSV parsing | papaparse |
| PDF export | Playwright (headless Chromium) — see `docs/pdf-research.md` |
| LLM | Anthropic Claude Haiku 4.5 — tool use, forced `tool_choice`, key server-only. Haiku chosen because the task is narrow (one forced tool call filling a zod-constrained schema); a larger model adds latency and cost with no quality benefit here |
| Deployment | Vercel — `@sparticuz/chromium` supplies headless Chromium in the serverless runtime |
