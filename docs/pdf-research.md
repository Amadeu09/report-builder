# PDF Generation — Landscape Research & Build-vs-Buy Decision

## 1. Scope

PDF export is this project's central build-vs-buy call because the decision
determines whether the report is implemented once or twice. The Relats report uses
a bespoke visual system — CSS custom properties, hand-rolled SVG charts, Inter
typography, Relats orange fills — that must survive the rendering pipeline intact.
The wrong choice means either rebuilding the entire report in a foreign layout
engine or paying a per-document fee indefinitely.

## 2. Decision

**Build: render the existing on-screen report with Playwright (headless Chromium)
via `playwright-core` + `@sparticuz/chromium`. No PDF library. No third-party
rendering API.**

## 3. Options Surveyed

### Headless-browser engines (open-source)

| Tool | Verdict |
|---|---|
| **Playwright** (`playwright-core` + `@sparticuz/chromium`) | **Selected.** Full Chromium engine; `page.pdf()` with `preferCSSPageSize` and `printBackground` reproduces every CSS variable, SVG arc, and webfont exactly. Serverless-compatible via `@sparticuz/chromium`. |
| **Puppeteer** | Functionally identical for this use case. Playwright chosen for cleaner async API and first-class TypeScript types; either would work. |

### OSS PDF / render libraries

| Tool | Verdict |
|---|---|
| **`@react-pdf/renderer`** | Own Yoga/flexbox layout engine, not CSS. Reproducing the Relats brand — CSS custom properties, SVG charts, `@page` rules — requires rewriting the entire report tree. Zero-infra, but fidelity cost is prohibitive when an HTML report already exists. |
| **pdfmake** | Imperative JSON-driven layout. No React, no CSS. A full second implementation from scratch. Rejected. |
| **jsPDF** | Client-side canvas path; quality degrades on complex SVG and custom fonts. Not production-grade for a multi-page branded report. |
| **WeasyPrint** | Python runtime; not available in a Node/Next.js serverless environment without a sidecar. Excellent CSS Paged Media support but wrong stack. |
|

### Paid APIs / SaaS

| Tool | Verdict |
|---|---|
| **DocRaptor** (PrinceXML-backed) | Best CSS print typography among paid options. Rejected: per-document pricing, PrinceXML licence cost, and Prince is a different engine from Chrome — our browser-tuned HTML/SVG would need re-tuning, losing the "identical to screen" guarantee. |
| **PrinceXML licence** | Same engine, self-hosted. Strong print CSS; commercial licence cost disproportionate to project scale. |
| **PDFShift** | REST API wrapping headless Chrome — same engine as Playwright. Solves the serverless Chromium problem at the cost of vendor lock-in and per-document pricing with no fidelity advantage over the build path. |

## 4. Decision Criteria

| Criterion | Playwright | `@react-pdf` | Paid API (DocRaptor / PDFShift) |
|---|---|---|---|
| CSS + SVG fidelity | Full — same Chromium engine as preview | Partial — own Yoga engine, manual SVG re-impl | Full via Chrome; partial via Prince |
| Reuse of existing report | Maximal — renders the live route as-is | None — full rebuild required | Partial — sends HTML, but may need tuning |
| Single renderer (no drift) | Yes | No — two parallel implementations | No — vendor owns the render |
| Per-document cost | Zero | Zero | Ongoing (pricing varies) |
| Vendor lock-in | None | None | High |
| Infra/ops burden | `@sparticuz/chromium` wiring on serverless | None | None (API call) |
| Data privacy | In-house | In-house | Client data leaves the app |

## 5. Why Playwright

The decisive argument is that fidelity is **inherited**, not re-engineered.

The export route (`app/api/export-pdf/route.ts`) navigates Playwright's headless
Chromium to `/report/print` — the same React component tree that drives the
on-screen preview — and calls `page.pdf({ preferCSSPageSize: true, printBackground: true })`.
`preferCSSPageSize` delegates page dimensions and margins entirely to the `@page`
rule in `print.css`, so layout is controlled in one place. `printBackground: true`
preserves Relats orange fills and surface backgrounds that browsers suppress in
print mode by default. `waitUntil: 'networkidle'` ensures Inter webfont finishes
loading before capture, so typography matches the preview exactly.

The result: every CSS custom property (`--color-relats-orange`, `--color-data-N`,
etc.), every hand-rolled SVG arc in `Donut.tsx`, every computed Tailwind v4 layout
value flows into the PDF without a second implementation. There is one component
tree and one source of truth. A change to a component or a colour token appears in
both the screen and the PDF automatically.

## 6. Honest Trade-offs

- **Heavy dependency.** `playwright-core` + `@sparticuz/chromium` add ~40–50 MB
  to the deployment bundle — the largest operational cost of this choice.
- **Serverless wiring.** Local dev uses Playwright's bundled Chromium; Vercel
  requires the `@sparticuz/chromium` adapter (the `process.env.VERCEL` branch in
  `route.ts`). This dual-path is a small but real maintenance surface.
- **Cold starts.** Launching a headless browser on a serverless function
  is slower than a pure-JS PDF call. The route sets `maxDuration = 60s`,
  which sits right at the current Vercel Hobby per-function ceiling (60s;
  up to 300s with Fluid Compute). A cold Chromium launch plus render fits
  inside that window for this report, but it consumes a large share of the
  Active-CPU / GB-hours budget — so sustained production volume points to
  Pro for headroom, not because of a timeout.
- **Larger deploy footprint.** Standard Vercel Next.js functions exclude native
  binaries; `@sparticuz/chromium` works around this but bumps the function size.

These are known, accepted costs in exchange for zero fidelity compromise.

## 7. When Buying Would Win

The calculus flips under three conditions:

1. **Tagged PDF / PDF-UA accessibility.** Chromium's `page.pdf()` does not produce
   a tagged PDF. If screen-reader compliance were a hard requirement, DocRaptor
   (PrinceXML) is the stronger choice.
2. **High render volume.** At thousands of exports per day, Chromium cold-start
   overhead and function duration costs could exceed a per-document API price. At
   this project's scale the crossover is never reached.
3. **Eliminating Chromium infra entirely.** If the deployment target changed to an
   environment where `@sparticuz/chromium` is unavailable (e.g. a constrained edge
   runtime), a paid API or a pure-JS library would become necessary.

None of these conditions apply here.

## 8. Secondary Decision: Hand-Rolled SVG Charts

Both hero charts (`components/report/charts/Donut.tsx`, `Bar.tsx`) are
implemented as plain SVG — no recharts, Chart.js, or D3.

**Why:** full pixel control with no render dependency in the PDF pipeline. The
donut arcs use CSS custom properties (`var(--color-data-N)`) that resolve
correctly in Chromium and carry into the PDF unchanged. A charting library would
introduce its own DOM structure and style assumptions that could conflict with
`printBackground` or `preferCSSPageSize`, and would add a dependency with no
advantage for two fixed chart types.

**Trade-off:** more code owned. Arc geometry, gap spacing, and legend layout are
written and maintained here. For a report with two stable chart types and a fixed
data model, this is the right trade — the code is small, auditable, and entirely
under our control.