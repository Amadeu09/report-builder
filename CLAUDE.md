# CLAUDE.md — Report Builder

> Single source of truth for this project. Read this fully before writing or
> changing any code. If a request conflicts with this file, stop and flag it.

---

## 1. What this project is

A small **Next.js web app that turns sample carbon‑emissions data (a CSV) into a
polished, branded PDF carbon report**, designed for the client **Relats**.

This is a **technical interview challenge** for **Footprint Mappa** (a "Climate OS
for Industry" company). The deliverable is judged not on size but on **judgement,
scoping and defensibility**.

### The single most important principle

> **Small + deeply understood + defensible > big + unowned.**

In the age of AI, anyone can generate a lot of code. The evaluators explicitly
reward restraint and clarity. **Do not over‑build.** Every file, decision and line
must be explainable in a live demo. When in doubt, do less, but do it well and
make it correct.

### How this work is evaluated (keep these in mind constantly)

- **Understanding & defensibility** — can every decision be defended out loud?
- **Scoping & decisiveness** — a tight scope done well beats a broad one half‑done.
- **Code & data architecture** — clean layers, typed data, no magic strings.
- **Design & UX** — *fidelity to Relats branding* is an explicit graded axis.
- **Product & creativity** — does it feel like a real tool for a real user?
- **AI‑assisted workflow** — how AI was used is part of the score (see §13).
- **Research & build‑vs‑buy** — especially the PDF‑generation choice (see §5).

---

## 2. Scope: what we are building (and what we are NOT)

**Domain: OCF — Organisational Carbon Footprint** (ISO 14064‑1 / GHG Protocol,
Scope 1 / 2 / 3). We are **NOT** doing PCF (product footprint). Ignore the PCF
CSV/report except as background.

**We are building two layers:**

- **Path A (the floor, must always ship):** load the OCF CSV → render a correct,
  Relats‑branded report on screen → export it to PDF.
- **Path C (the upside, on top of A):** a natural‑language layer. The user types
  a change in plain language ("show only Scope 3", "compare the three plants",
  "rename the title") → Claude returns a **validated `reportSpec` (JSON)** → the
  deterministic renderer re‑draws the report from that spec.

**Hard rule:** Path A must remain shippable on its own. Path C is layered on top
and time‑boxed. If Path C is incomplete, the app must still produce a correct
report + PDF.

**Out of scope / explicit non‑goals:**

- **No carbon‑footprint *calculation* methodology.** We render provided data; we
  do not compute emission factors.
- **No year‑over‑year comparison.** The sample CSV is single‑year only (the sample
  report's 2023‑vs‑2024 section cannot be reproduced from the data). Treat YoY as
  a "with more time" item, not a feature.
- **No database / no Xano** (see §5). No auth. No multi‑tenant.

---

## 3. The core architecture (the spine of Path C)

```
NL prompt ──► /api/generate-spec ──► Claude API ──► reportSpec (JSON)
                                                        │
                                                  zod validation
                                                        │
                                                        ▼
                          report data (from CSV) + reportSpec
                                                        │
                                                        ▼
                              deterministic React renderer
                                   │                    │
                            on‑screen preview      /api/export-pdf
```

**Non‑negotiable design rule:** the LLM **only fills a constrained, zod‑validated
`reportSpec`**. It never emits layout, HTML, or data. Our code owns the data and
the rendering; Claude only edits a configuration object whose shape we control.

Why this matters (say this in the demo):
- **Defensible** — the contract is small and ours; we can explain every field.
- **Secure** — no path for the model to inject markup/JS into the render (no XSS).
- **Cheap** — most of the work is the deterministic renderer, not the AI.

---

## 4. Rendering model — server vs client (READ THIS)

This is a **single full‑stack Next.js project** (App Router). Front and back live
together. **Do not treat it like a separate SPA + REST backend.** Choose the
right mechanism per case:

- **Server Components (default):** read the CSV, build the dataset, and render the
  report **directly**, with **no HTTP endpoint**. This is the idiomatic path and
  how the report + preview should work.
- **Route Handlers (`app/api/.../route.ts`):** create an endpoint **only where
  there is a real boundary**:
  - `app/api/export-pdf` — browser triggers a file download; PDF is generated
    server‑side.
  - `app/api/generate-spec` — Path C; must run server‑side to hide the API key.
- **Server Actions (`"use server"`):** acceptable alternative for the Path C call
  if cleaner than a Route Handler.

**Anti‑pattern to avoid:** wrapping internal data access in REST endpoints. If no
client interaction or secret is involved, use a Server Component.

---

## 5. Tech stack (exact, required)

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router) | `next@16.2.9`, use latest stable |
| UI runtime | **React 19** | `react@19.2.4` |
| Language | **TypeScript** | conscious deviation from the brief's "JS/JSX"; justified by type‑safe data modelling + `reportSpec`. Note this in the README. |
| Styling | **Tailwind CSS v4** | CSS‑first config (`@theme` in `globals.css`) |
| Components | **shadcn/ui (new‑york)** + **Radix UI** + **Lucide** | shadcn components are copied into `components/ui/`; own and edit them |
| Validation | **zod** | all external data + the `reportSpec` |
| CSV parsing | **papaparse** | `npm i papaparse` + `-D @types/papaparse` |
| Deployment | **Vercel** | final step only; build locally first |
| Backend service | **none (no Xano)** | the app has no DB/persistence needs; Next API routes cover the small server work. **Document this build‑vs‑buy decision in the README.** |

### PDF generation — OPEN DECISION (this is a graded research task)

Do not silently pick a library. The README must include a short landscape +
build‑vs‑buy justification. The two serious contenders for a *branded, design‑heavy*
PDF are:

- **HTML/CSS → PDF via headless Chromium (Playwright/Puppeteer)** — best visual
  fidelity, reuses the exact React/Tailwind report; cost: heavier on serverless
  (needs `@sparticuz/chromium` on Vercel).
- **`@react-pdf/renderer`** — deterministic, no browser; cost: its own layout
  engine (not real CSS), so branding is more manual.

Paid APIs (DocRaptor/PrinceXML, PDFShift) are the "buy" option — cite as best CSS
fidelity but rejected for a one‑week scope. Recommended default unless research
says otherwise: **render the report as a normal React route and export via
Playwright print**, so one component tree serves both the on‑screen preview and
the PDF.

---

## 6. Folder structure

```
report-builder/
├─ app/
│  ├─ page.tsx                      # app shell / landing
│  ├─ report/preview/page.tsx       # in‑browser report preview (Server Component)
│  └─ api/
│     ├─ generate-spec/route.ts     # Path C: NL → Claude → validated reportSpec
│     └─ export-pdf/route.ts        # render → PDF download
├─ components/
│  ├─ ui/                           # shadcn (generated, owned)
│  └─ report/                       # the report itself; shared by preview + PDF
├─ lib/
│  ├─ data/                         # CSV parsing, zod schemas, OCF domain model
│  ├─ spec/                         # reportSpec schema (zod) + defaults
│  └─ branding/relats.ts            # Relats tokens in TS (for charts)
├─ data/                            # sample CSV(s)
└─ docs/                            # README rationale, PDF research, AI‑usage log
```

`components/report/` must be a **single component tree used by both the preview and
the PDF export** — do not duplicate the report for PDF.

---

## 7. The data (OCF)

Source file: `data/sample_ocf_iso_14064.csv`. Units are **kg CO₂e**.

**Rows (4):** `Planta Barcelona`, `Planta Valencia`, `Planta Sevilla`, and
`Total empresa`. **`Total empresa` is a roll‑up** (exact sum of the three plants),
**not a fourth plant** — model it as the aggregate, separate from the plant list.

**Hierarchy (3 levels):** `total_emissions` → `total_scope_1/2/3` → individual
categories. Verified internally consistent: subcategories sum to their scope total,
and scope totals sum to `total_emissions`.

### Category registry — the single source of truth

Define every category once in `lib/data/categories.ts`. Parser, report and
`reportSpec` all read from it (no magic strings anywhere else).

| Scope | CSV column | Code | Label |
|---|---|---|---|
| 1 | `scope_1_1_stationary_combustion` | 1.1 | Stationary combustion |
| 1 | `scope_1_2_mobile_combustion` | 1.2 | Mobile combustion |
| 1 | `scope_1_3_process_emissions` | 1.3 | Process emissions |
| 1 | `scope_1_4_1_refrigerant_gases` | 1.4.1 | Refrigerant gases |
| 1 | `scope_1_4_2_fire_extinguishers` | 1.4.2 | Fire extinguishers |
| 2 | `scope_2_1_1_purchased_electricity` | 2.1.1 | Purchased electricity |
| 2 | `scope_2_1_2_purchased_heat_or_steam` | 2.1.2 | Purchased heat or steam |
| 3 | `scope_3_1_1_raw_materials_or_auxiliary_materials` | 3.1.1 | Raw & auxiliary materials |
| 3 | `scope_3_1_2_water_consumption` | 3.1.2 | Water consumption |
| 3 | `scope_3_1_3_services` | 3.1.3 | Services |
| 3 | `scope_3_2_capital_fixed_assets` | 3.2 | Capital / fixed assets |
| 3 | `scope_3_3_fuel_and_energy_related_activities` | 3.3 | Fuel & energy related activities |
| 3 | `scope_3_4_upstream_transport_and_distribution` | 3.4 | Upstream transport & distribution |
| 3 | `scope_3_5_waste_generated_in_operations` | 3.5 | Waste generated in operations |
| 3 | `scope_3_6_business_travel` | 3.6 | Business travel |
| 3 | `scope_3_7_employee_commuting` | 3.7 | Employee commuting |
| 3 | `scope_3_8_upstream_leased_assets` | 3.8 | Upstream leased assets |
| 3 | `scope_3_9_downstream_transport_and_distribution` | 3.9 | Downstream transport & distribution |
| 3 | `scope_3_10_processing_of_sold_products` | 3.10 | Processing of sold products |
| 3 | `scope_3_11_use_of_sold_products` | 3.11 | Use of sold products |
| 3 | `scope_3_12_end_of_life_treatment_of_sold_products` | 3.12 | End‑of‑life treatment of sold products |
| 3 | `scope_3_13_downstream_leased_assets` | 3.13 | Downstream leased assets |
| 3 | `scope_3_14_franchises` | 3.14 | Franchises |
| 3 | `scope_3_15_investments` | 3.15 | Investments |

Scope total columns: `total_scope_1`, `total_scope_2`, `total_scope_3`.

### Data‑layer rules

- Validate every row with **zod** (`z.coerce.number().nonnegative()` for all
  numeric columns; CSV values arrive as strings).
- Transform the flat row into a **typed hierarchical model**
  (`entity → scope → categories`); the report consumes the model, never raw rows.
- Run a **runtime consistency check** (subcategories sum to scope total; scopes
  sum to total). Surface mismatches as **warnings, not fatal errors**, so a
  slightly‑off input still renders. (Current data passes cleanly.)

---

## 8. The reportSpec (heart of Path C)

A small, zod‑validated configuration object that fully determines the rendered
report. Conceptual shape (finalise in `lib/spec/`):

```ts
// illustrative — refine in lib/spec/schema.ts
type ReportSpec = {
  title: string;                 // e.g. "Organisational Carbon Footprint 2024"
  entity: string;                // which row to feature ("Total empresa" by default)
  sections: SectionId[];         // which sections, in what order
  scope3: {
    topN: number;                // collapse the long tail into "Other"
    sort: "value-desc" | "code-asc";
  };
  branding: { accent: string };  // defaults to Relats orange
};
```

Rules:
- The spec references only **known IDs from the registry** — it cannot invent
  arbitrary content.
- Always parse Claude's output with the zod schema before use; on failure, fall
  back to the default spec and surface a warning. Never render unvalidated output.
- A sensible **default spec** must render a complete, correct report with zero AI
  involvement (that is Path A).

---

## 9. Branding — TWO brands, two places (do not mix)

| | Used for | Source |
|---|---|---|
| **Relats** | the **report (PDF)** — primary | reconstructed from relats.com (no kit provided — reconstructing it faithfully is graded) |
| **Footprint Mappa** | the **app UI** — optional polish | `BrandBook_Footprint_Mappa.pdf` |

**The report uses Relats branding. The app UI uses Mappa branding (optional) or
stays neutral. Never style the report with Mappa, and never style the report with
default/Office colours.**

### Relats tokens (report) — add to `globals.css`, used only in `components/report/`

```css
@theme {
  --color-relats-orange: #FF5710;        /* CONFIRMED from relats.com metadata */
  --color-relats-orange-dark: #D8480D;
  --color-relats-orange-tint: #FFF1EA;
  --color-ink: #1A1A1A;
  --color-slate: #5B5F66;
  --color-rule: #E6E6E6;
  --color-surface: #F7F7F5;
  --color-positive: #2E7D5B;             /* reductions */
  --color-negative: #C0392B;             /* increases */
  --color-data-1: #FF5710;               /* on‑brand chart ramp */
  --color-data-2: #FF8A52;
  --color-data-3: #FFB98F;
  --color-data-4: #5B5F66;
  --color-data-5: #1A1A1A;
  --font-report: "Inter", system-ui, sans-serif; /* PLACEHOLDER — confirm Relats' real face in DevTools */
}
```

- Do **not** override shadcn's `--primary` with Relats orange — keep app and report
  brands separate.
- **Open assets to obtain from relats.com:** the exact heading typeface and a
  vector **Relats logo** for the report header.
- Brand feel: industrial, modern, clean, white background, orange as the single
  strong accent. Tagline language: "Sustainable solutions for people's safety."

### Mappa tokens (app UI only, optional)

Palette lives in a **gradient**, not solids: `#FDC2D8`, `#FCA65E`, `#FF7983`,
`#041282`. Backgrounds **black or white only**. Typeface **BDO Grotesk**
(regular default, bold for emphasis).

---

## 10. The report — structure and visuals

Model the report on the sample OCF deliverable (`FMappa_Relats_Sample_Scope1_2_3.docx`),
adapted to single‑year data. Sections, in order:

1. **Cover / header** — Relats logo + title + year. Small "Prepared by Footprint
   Mappa" mark in the footer (mirrors reality; the sample carried Mappa's logo).
2. **Introduction** — what the report is, standards (GHG Protocol, ISO 14064‑1).
3. **Methodological approach** — operational‑control boundary, scopes 1/2/3.
4. **Global results** — total kt CO₂e, scope split, per‑plant ranking.
5. **Scope 1 / Scope 2 / Scope 3** — per‑scope breakdown; Scope 3 is the dominant
   story (purchased goods, end‑of‑life, downstream transport, capital goods lead).
6. **Conclusions** (and optionally recommendations).

### The two hero charts (replicate these patterns, in the Relats orange ramp)

- **Donut** with the **total in the centre**, a **ranked legend with percentages**,
  and the long tail collapsed into an **"Other categories"** bucket (use
  `scope3.topN`). Use this for the scope split and/or Scope 3 by category.
- **Horizontal ranked bar chart** with value labels, categories sorted descending.

The sample charts were **inconsistently styled** (green mono in one, categorical in
another). **Opportunity:** apply one consistent Relats palette across all charts —
this will look more polished than the sample and scores on design fidelity.

Display convention: values are kg CO₂e in the data; present large figures as
**kt CO₂e** (divide by 1000) like the sample, with sensible rounding.

---

## 11. Coding conventions / best practices

- **TypeScript strict.** No `any` in committed code; model real types.
- **zod at every external boundary** (CSV in, LLM out).
- **Registry‑driven, no magic strings** — category keys/labels/codes come from
  `lib/data/categories.ts`.
- **Server Components by default;** add an endpoint only for a real boundary (§4).
- **Small, focused components.** The report is composed of section components +
  reusable chart components, all driven by `(data, reportSpec)`.
- **One report tree** for preview and PDF.
- **Pure, testable transforms** in `lib/` (data → model → view data); keep
  rendering dumb.
- **Accessibility:** semantic headings, alt/aria on charts where feasible.
- **Comments explain *why*, not *what*.** Keep them sparse and meaningful.
- **No dead code, no speculative abstractions.** Build for the current scope only;
  list ideas in the README's "with more time" instead of coding them.

---

## 12. Security rules (production‑aware)

- **The Anthropic API key is server‑only.** Store as `ANTHROPIC_API_KEY` (an env
  var **without** the `NEXT_PUBLIC_` prefix). Use it **only** inside
  `app/api/generate-spec`. Never reference it from client code.
- **Always validate the LLM's `reportSpec` with zod** before rendering. The model
  never emits HTML/markup — it only fills the constrained spec.
- **PDF renderer:** do not load remote resources based on user input.
- **Production hardening to NOTE in the README (not necessarily implement):**
  rate‑limit / auth the `generate-spec` route (cost protection), validate
  user‑uploaded CSVs (size/type), sandbox the PDF renderer.

---

## 13. AI‑assisted workflow (this is graded)

- Maintain `docs/ai-usage-log.md`: what was delegated to Claude vs decided by the
  human, and which tools/workflows were used (this `CLAUDE.md` + a spec‑driven
  approach is itself part of that story — mention it).
- Prefer Claude (the evaluators do). Be transparent and specific in the README:
  "I delegated X, I designed/decided Y, I verified Z."

---

## 14. Deliverables & language

1. **GitHub repo** (public, or private with collaborator `victorcuadrat`).
2. **README rationale** — path chosen + why, what you'd do with more time, time
   spent, how AI was used.
3. **PDF landscape + build‑vs‑buy research** (see §5).
4. **Live demo** — be ready to defend every file.

**Language:** code, repo and written rationale in **English**. The demo is in
Spanish or Catalan.

---

## 15. Commands

```bash
npm run dev      # local development
npm run build    # production build (must pass before deploy)
npm run lint     # eslint
```

Node ≥ 22 LTS (the toolchain warns below 20.17). Install deps:
`npm i zod papaparse` + `npm i -D @types/papaparse`.

---

## 16. Status & next steps

**Done:** project scaffolded (Next 16 + TS + Tailwind v4 + shadcn new‑york /
Radix / Lucide), running locally. Relats decision: **OCF**, Path C on Path A, no
Xano. Branding researched. **No feature code written yet.**

**Next, in order:**
1. `lib/data/` — categories registry, zod schema, OCF model, CSV parser + checks.
2. `components/report/` — report sections + the two hero charts, Relats‑branded,
   as a Server Component reading the CSV (Path A on screen).
3. `app/api/export-pdf` — PDF export of the report tree (after PDF research).
4. `lib/spec/` + `app/api/generate-spec` + chat UI — Path C.
5. `docs/` — README rationale, PDF research, AI‑usage log; deploy to Vercel.

---

## 17. Do / Don't (quick reference)

**Do**
- Keep Path A always shippable; layer Path C on top.
- Validate all external data and all LLM output with zod.
- Brand the report with Relats; keep the app UI separate.
- Use Server Components for data/render; endpoints only for PDF + Claude.
- Prefer the smallest correct solution; defer extras to the README.

**Don't**
- Over‑build, add speculative features, or generate code you can't defend.
- Mix Relats and Mappa branding, or use default/Office colours in the report.
- Put the API key anywhere a client bundle can see it.
- Let the LLM emit HTML/layout/data — only the validated `reportSpec`.
- Reproduce the 2023‑vs‑2024 comparison (no data for it).
- Add Xano or any database.

---

## 18. Claude Code workflow (subagents & features)

Use Claude Code's features with **judgement, not for show** — a few well‑chosen,
project‑specific tools you can defend beat a generic swarm. Knowing what *not* to
use is part of the signal.

### Project subagents (in `.claude/agents/`, committed to the repo)

- **`report-reviewer`** (read‑only: Read, Grep, Glob, Bash) — reviews recent
  changes against this file. Invoke proactively after each feature or before
  committing: *"Use the report-reviewer subagent on my latest changes."*
- **`pdf-researcher`** (read‑only + web + Write) — runs the PDF‑generation
  landscape research in its own context and writes `docs/pdf-research.md` (a graded
  deliverable). Use once, for the PDF decision (§5).

Subagents run in isolated context windows and return only a summary, keeping the
main session clean. That context‑hygiene is the reason to use them.

### Other practices

- **Plan mode before each phase** (data layer, report, PDF, Path C): research →
  propose a plan → approve → execute. This enforces deliberate scoping.
- **AI‑usage log** (`docs/ai-usage-log.md`): record which features were used and
  why, and which were deliberately skipped.

### Deliberately NOT used (and why)

Agent teams, background agents, nested subagents, and worktrees — these target
massive parallelism or multi‑session work, which is over‑engineering for a
one‑week solo project. Staying lean here is a deliberate, defensible choice.

### Project skill (in `.claude/skills/`)

- **`report-design`** — the Relats visual system + chart anatomy for the report.
  Claude Code loads it automatically when working in `components/report/`. When
  building or styling any report UI, follow this skill (do not restate its contents
  here — it is the source of truth for report design).