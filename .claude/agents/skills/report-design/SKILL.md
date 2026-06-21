---
name: report-design
description: Use when building or styling any component under components/report/ for the carbon report. Encodes the Relats visual system, the report's chart anatomy (donut, ranked bars), number formatting, and layout conventions so report UI is on-brand and consistent.
---

# Report design — Relats carbon report

This skill governs the **visual design of the report** (`components/report/`), which
is branded for **Relats** and exported to PDF. It does **not** apply to the app UI.

## Golden rules

- Brand the report with **Relats** only. Never use Mappa colours or default/Office
  colours here.
- Single strong accent: **Relats orange** (`#FF5710`). Everything else is neutral.
- Clean, industrial, modern, lots of whitespace, white background, thin rules for
  structure. Print‑first: this renders to PDF.
- Charts must be **SVG‑based** (they must survive HTML→PDF export). Avoid
  canvas‑based chart libs. Use a SVG lib (e.g. recharts) or hand‑rolled SVG.

## Colour tokens (already defined in globals.css `@theme`)

Use these Tailwind utilities — never hard‑code hex in components:

- `relats-orange` (#FF5710) — primary accent, key figures, primary series.
- `relats-orange-dark` / `relats-orange-tint` — hover/emphasis / soft fills.
- `ink` (#1A1A1A) — primary text & headings. `slate` (#5B5F66) — secondary text.
- `rule` (#E6E6E6) — borders, separators, axes. `surface` (#F7F7F5) — soft section bg.
- `data-1..5` — the chart ramp: `#FF5710, #FF8A52, #FFB98F, #5B5F66, #1A1A1A`.
- `positive` (#2E7D5B) reductions · `negative` (#C0392B) increases.

Apply a **consistent palette across all charts** (the sample report was
inconsistent — fixing that is a design win).

## Typography

- Font: `--font-report` (Inter placeholder — confirm Relats' real face later).
- Scale tokens: `text-display` (cover), `text-h1`, `text-h2`, `text-body`,
  `text-caption`. Headings in `ink`; captions/labels in `slate`.

## Number formatting

- All emissions shown in **kt CO₂e** via the shared formatter (`formatKt`, which is
  `kg / 1_000_000`). Never divide by 1000 (that's tonnes — the 1000× bug).
- Headline totals: 2–3 significant figures (e.g. `5.05 kt CO₂e`). Shares as `%`.

## Chart anatomy (the two hero charts)

### Donut — scope split or Scope 3 by category
- **Total in the centre** (e.g. `5.05` over `kt CO₂e`, ink + slate).
- Ranked **legend**: each row = colour swatch · label · value (kt) · share (%).
- Sort categories descending; collapse the long tail into **"Other categories"**
  using `reportSpec.scope3.topN`.
- Colours from the `data-1..5` ramp.

### Horizontal ranked bar — categories
- Categories sorted **descending** by value; value label at the bar end (kt).
- Single consistent colour (or the ramp); axis/gridlines in `rule`; labels in `slate`.

## Component conventions

- Report components are **pure presentation**, driven by `(data, reportSpec)` props.
  No data fetching or transformation inside them (that lives in `lib/`).
- Compose by section (cover, intro, methodology, global results, scope 1/2/3,
  conclusions) — mirror the sample report structure, single‑year.
- Semantic headings (`h1/h2/...`); charts get an accessible label/`aria`/`alt`.
- Footer: small **"Prepared by Footprint Mappa"** mark; header carries the Relats logo.

## Example — a key‑figure block and a section header

```tsx
// A headline stat used in "Global results"
function KeyFigure({ label, kt }: { label: string; kt: number }) {
  return (
    <div className="rounded-lg border border-rule bg-surface p-5">
      <div className="text-caption text-slate">{label}</div>
      <div className="mt-1 text-display font-semibold text-ink">
        {formatKt(kt)} <span className="text-h2 text-slate">kt CO₂e</span>
      </div>
    </div>
  );
}

// A section header with the Relats accent rule
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-h1 font-semibold text-ink border-l-4 border-relats-orange pl-3">
      {children}
    </h2>
  );
}
```

Mirror this token‑driven, accent‑restrained style in every report component.
