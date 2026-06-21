PDF Export — Landscape Research & Build-vs-Buy Decision

Station 3 · Report Builder · Organisational Carbon Footprint (OCF) report for Relats


Scope of this document: decide how to turn the already-built on-screen report
into a branded PDF, survey the realistic options (open-source, self-hosted, and
paid), and justify the choice. The decision is build with Playwright (HTML → PDF
via headless Chromium); the reasoning is below.




1. Context & requirement

By the time this decision is made, the report already exists as a working on-screen
artifact (Station 2):


It is rendered entirely with React Server Components — no client-side JavaScript,
no hydration.
The two charts (scope-split donut, category bars) are hand-rolled inline SVG, not a
charting library.
All colours come from CSS custom properties (the Relats token set:
--color-relats-orange: #FF5710, neutrals, and the --color-data-* ramp), which
cascade into the inline SVG exactly as they do into HTML.
Data flows through a single typed pipeline (CSV → Zod validation → OcfDataset →
view-model transforms → components). There is one source of truth for both data and
branding.


This shapes the requirement. We are not generating a PDF from raw data; we already
have a faithful HTML/SVG rendering of the report. The job is to get that rendering onto
A4 pages without losing fidelity. Concretely, the export must:


Match the on-screen report 1:1 — same layout, same Relats branding, same charts.
Preserve a single source of truth — no second copy of the layout or the tokens
that can drift from the first.
Produce print-correct A4 output — page size, margins, page breaks that don't cut
charts or key figures in half, and backgrounds/fills that actually print.
Run inside the existing Next.js app with minimal new surface area.
Be reproducible and self-contained — the challenge is a one-week, low-volume
deliverable, not a high-throughput production service.


A note on the deployment constraint: the brief states that Xano and Vercel are
encouraged but not mandatory, especially for Path A. Deployment to Vercel is therefore
a nice-to-have, not a hard gate. This materially affects the decision, because the
single biggest cost of the chosen approach (running Chromium in a serverless function)
is optional rather than required.


2. Evaluation criteria

Each option below is judged against the same axes, ordered roughly by weight for this
project:

#CriterionWhy it matters here1Fidelity to the on-screen reportThe report is already designed and approved; the PDF must look like it, including the SVG charts and the Relats orange.2Reuse / implementation effortOne week, single candidate. Throwing away Station 2 to rebuild the layout is expensive.3Single renderer / maintenanceTwo renderers (screen + PDF) means two places to fix every change — fidelity drift over time.4Layout & pagination controlA4, margins, page breaks, repeated headers/footers.5Deployment friendliness (Vercel)Optional, but a clean deploy story is a plus.6Runtime cost & cold startRelevant if deployed serverless; irrelevant locally.7Cost & licensingPaid APIs bill per document; self-hosted is free but needs infra.8Data privacy / egressThe report contains a client's (Relats') emissions data; sending it to a third-party renderer is a real consideration.


3. Options surveyed

Two broad approaches exist, and almost every tool is one of them:


HTML/CSS → PDF: write the markup, let a browser/print engine render it to PDF.
Maximum control, you own the layout.
Template-based / programmatic: build the document in a different primitive model
(a visual editor, or a library's own component tree) and feed it data.


Because we already have the HTML/CSS/SVG, the first approach is the natural fit. The
options are grouped into build (self-hosted) and buy (hosted services).

3.1 Build — self-hosted

Playwright / Puppeteer (headless Chromium, HTML → PDF) — chosen

Drives a real Chromium instance to render a page and call page.pdf(). Because it is
Chrome, it renders our existing HTML, Tailwind v4 CSS, CSS custom properties, and inline
SVG identically to what we see in the browser. Supports print CSS (@page, margins,
break-inside), backgrounds (printBackground: true), and headers/footers.


Fidelity: highest possible — same engine that renders the screen version.
Reuse: maximal — the report tree is rendered as-is; no re-implementation.
Maintenance: one renderer, one source of truth.
Cost: free (open-source).
Cost elsewhere: the Chromium binary is heavy, which is the whole serverless story
(see §6). Playwright and Puppeteer are near-equivalent for this; Playwright is chosen
for its cleaner API and first-class print support.


@react-pdf/renderer — rejected

A pure-JS library that renders PDFs from its own React primitives (Document,
Page, View, Text, Svg) using a Yoga/flexbox layout engine. It deploys anywhere
with no browser binary.


Fidelity / reuse: poor for this project. It does not use HTML or CSS. There
is no Tailwind, no CSS custom properties, and only a subset of SVG and flexbox. We
would have to rebuild the entire report in its component model and re-implement
both hand-rolled SVG charts against its <Svg> primitives.
Maintenance: worst case — two parallel renderers for one report, guaranteed to
drift.
Verdict: great when you start from data and have no existing HTML report. We are
the opposite case. Rejected.


wkhtmltopdf — rejected

An older WebKit-based HTML → PDF binary.


Status: officially archived since January 2023, unmaintained, with unpatched
CVEs. Its WebKit is years behind, so modern CSS (flex/grid, custom properties) is
unreliable.
Verdict: disqualified on maintenance and fidelity grounds. Mentioned only to be
explicitly ruled out.


WeasyPrint — rejected

A Python HTML/CSS → PDF engine with strong CSS Paged Media support.


Fidelity: good for documents authored for it, but it is its own rendering
engine, not Chromium — our Chrome-tuned report (and inline SVG) would not be guaranteed
to match the screen version.
Stack fit: Python in an otherwise Next.js/TypeScript app adds a second runtime and
toolchain.
Verdict: sound tool, wrong stack and breaks the "same as on screen" guarantee.
Rejected.


Gotenberg — considered, not chosen

A self-hosted Docker service wrapping headless Chromium (and LibreOffice) behind an HTTP
API.


Fidelity: same as Playwright (it is Chromium).
Trade-off: it decouples PDF rendering into a separate container/service. That is a
real advantage at scale or when you want PDF generation off the app server — but it
adds an extra service to run and deploy for a single-app, low-volume challenge.
Verdict: the right answer if this were a high-volume product; overkill here. Worth
knowing it exists as the "self-host the renderer" middle path.


3.2 Buy — hosted services

These remove all infrastructure: send HTML (or a URL), get a PDF back. They are a
genuine option and the brief explicitly invites a buy recommendation if it's the smart
move. The honest assessment for this project:

ServiceEnginePricing (2026)NotesDocRaptorPrince XMLFree watermarked test docs; paid from ~$15/mo (≈125 docs); SOC 2 / HIPAA positioningBest-in-class print typography and CSS Paged Media. But Prince is a different engine than Chrome, so our browser-tuned HTML/SVG would need re-tuning, and we'd lose the "identical to screen" guarantee.PDFShiftHeadless ChromiumFree 50 credits/mo; paid from ~$9/mo (1 credit per 5 MB)Same engine as Playwright, so fidelity would match — but as a paid external dependency.Api2PdfChrome / wkhtmltopdf / LibreOfficePay-per-use (~$0.001–0.005 per PDF), no monthly minimumCheapest at spiky volume; pure plumbing, no UI.Template APIs (PDFMonkey, CraftMyPDF, APITemplate)VariousFree tiers + paidDesigned for the template-based approach — you rebuild the doc in their editor. Wrong fit when we already own the HTML.

Why not buy, for this project:


Data egress. Every hosted option means sending Relats' emissions data (the report
HTML) to a third party. For a client-confidential carbon report, keeping rendering
in-house is the safer default.
Cost with no offsetting benefit. These services earn their price by removing
infrastructure burden at scale. At this challenge's volume (effectively one report),
there is no scaling pain to outsource.
Fidelity. The only buy option that matches our fidelity for free (PDFShift) is
just hosted Chromium — i.e. exactly what Playwright gives us locally, minus the data
egress and cost.


When buy would win (recorded for defensibility): high or unpredictable volume; no
appetite to maintain a headless-browser deployment; or a hard requirement for PDF/A or
PDF/UA (tagged, accessible) output, where DocRaptor's Prince engine is the stronger
choice. None of these apply here.


4. Comparison matrix

Scored ✅ strong / 🟡 acceptable / ❌ weak, against §2 criteria.

OptionFidelityReuse / effortSingle rendererPagination controlVercel deployCostData privacyPlaywright (chosen)✅✅✅✅🟡¹✅ free✅ in-housereact-pdf🟡²❌❌🟡✅✅ free✅ in-housewkhtmltopdf❌🟡✅🟡🟡✅ free✅ in-houseWeasyPrint🟡²🟡❌✅🟡✅ free✅ in-houseGotenberg (self-host)✅✅✅✅🟡³✅ free✅ in-houseDocRaptor (buy)🟡²🟡❌✅✅❌ paid❌ egressPDFShift / Api2Pdf (buy)✅🟡🟡✅✅❌ paid❌ egress

¹ Solvable but non-trivial — see §6. And optional, since Vercel isn't mandatory.
² "Acceptable" only after re-tuning/rebuilding for a non-Chrome engine; not 1:1 with the screen version as-is.
³ Needs a separate container/host rather than the Next.js function itself.

The matrix makes the conclusion clear: Playwright is the only option that scores well on
the three highest-weighted criteria (fidelity, reuse, single renderer) without trading
them away, and its one weak spot (serverless deploy) is optional for this challenge.


5. Decision

Build the export with Playwright, rendering the existing report route to PDF via
headless Chromium.

The decisive factor is that Station 2 already produced a faithful, server-rendered
HTML + inline-SVG report whose colours live in CSS variables. Playwright renders that
exact output in the same engine the browser uses, so:


fidelity is automatic, not re-engineered;
there is one renderer and one source of truth — a change to a component or a token
appears in both the screen and the PDF with no second implementation;
the implementation cost is a print route plus a small API handler, not a rewrite.


@react-pdf/renderer is the strongest alternative in the abstract (clean serverless
deploy), but it is the wrong tool the moment an HTML report already exists, because it
forces a full rebuild in a different primitive model and a second renderer to maintain.
A paid API (the "buy" path) is a legitimate and sometimes smarter move — but here it adds
cost and third-party data egress to obtain fidelity we already get for free in-house, with
no scaling problem to justify it. The build cost is low precisely because of how
Station 2 was built; that is what tips the build-vs-buy call toward build.


6. Risks & mitigations

1. Chromium in a serverless function (only if deployed to Vercel).
The full playwright/puppeteer packages bundle a Chromium binary that far exceeds
Vercel's per-function size limit. The standard, tested fix is to depend on
playwright-core (no bundled browser) plus @sparticuz/chromium (a Chromium build
optimised for serverless); if the function is still over the size limit,
@sparticuz/chromium-min with the binary hosted separately. Known sharp edges to watch:
shared-library errors (libnss3.so / libnspr4.so), correct Node runtime, the
@sparticuz/chromium package needing to be marked external when bundling, and
serverless execution running materially slower than local. Mitigation / scope note:
Vercel is not mandatory for this challenge, so the primary plan is to run the export
locally (bundled Chromium) for the demo and document the serverless adaptation rather
than necessarily ship it. If a live deploy is wanted, deploying on a Node host (or
Gotenberg as a sidecar) avoids the serverless-size fight entirely.

2. Print fidelity — backgrounds and colours dropped.
Chromium's print path strips background colours/images by default, which would silently
remove the Relats orange and the donut fills. Mitigation: call
page.pdf({ printBackground: true, format: 'A4' }) and set
print-color-adjust: exact (with the -webkit- prefix) on coloured elements in the
print stylesheet.

3. Pagination — charts and key figures cut across page breaks.
The on-screen layout is a continuous scroll; A4 is paginated. Mitigation: a dedicated
print stylesheet — @page { size: A4; margin: … }, break-inside: avoid on
KeyFigure/chart/section cards, the cover as a full first page, and hiding the app-shell
chrome (the neutral wrapper, shadows) in print.

4. Fonts.
The report uses Inter (--font-report). Mitigation: ensure the font is available to
the rendering context (self-hosted/next/font or embedded) so the PDF doesn't fall back
to a system font and shift the layout.

5. Cold-start latency (serverless only).
Headless Chromium has a slow cold start. Mitigation: acceptable for an
on-demand-export UX; out of scope to optimise for the challenge. Caching/streaming noted
under §8.

6. Accessible / tagged PDFs.
@sparticuz/chromium does not emit tagged (PDF/UA) PDFs without a custom Chromium
recompile. Mitigation: out of scope here; if accessibility compliance were required,
that's the case where buying DocRaptor (Prince) becomes the right call.


7. Implementation plan (Station 3)


Print route — a dedicated render of the report tuned for paper (e.g.
/report/print), or the existing preview route gated by a print flag, so the
app-shell chrome is excluded.
Print stylesheet — @page A4 + margins, break-inside: avoid on cards and
charts, print-color-adjust: exact, hidden shell chrome.
/api/export-pdf handler — launch the browser (local: Playwright's bundled
Chromium; production: @sparticuz/chromium + playwright-core), render the print
route, call page.pdf({ printBackground: true, format: 'A4' }), and return the PDF
with appropriate headers.
Verify against the sample CSV — confirm the totals (5.05 kt CO₂e; scope split
71 / 23 / 6 %), the Relats orange, and both SVG charts render correctly on paper,
with no broken page breaks.



8. What I'd do with more time


Cache or stream the generated PDF instead of regenerating per request.
Ship and harden the serverless (@sparticuz/chromium) path and deploy the export on
Vercel.
Repeated page headers/footers (running title, page numbers) via Chromium's
header/footer templates.
Tagged/accessible PDF output (would reopen the build-vs-buy question in favour of
Prince/DocRaptor).
Multi-template support and a PCF report variant.



References

Current as of June 2026; consulted to keep tooling facts and pricing up to date.


Vercel serverless function size limit (~50 MB) vs. Chromium binary size (>280 MB),
and the playwright-core + @sparticuz/chromium approach —
https://www.zenrows.com/blog/playwright-vercel ;
https://dev.to/qudratullahdev/how-to-fix-chromium-on-vercel-a-complete-guide-to-solving-the-libnspr4so-error-4i9j
@sparticuz/chromium usage, chromium-min, bundler-external requirement, and
tagged-PDF recompile note — https://github.com/Sparticuz/chromium ;
https://www.npmjs.com/package/@sparticuz/chromium
Serverless execution ~4–8× slower than local; Vercel memory limits —
https://gist.github.com/kettanaito/56861aff96e6debc575d522dd03e5725
wkhtmltopdf archived (Jan 2023), unmaintained, unpatched CVEs —
https://pdfnoodle.com/blog/best-pdf-generation-apis
Hosted PDF API landscape and pricing (DocRaptor / Prince, PDFShift, Api2Pdf,
template-based APIs, Gotenberg self-hosted) —
https://www.pdfbroker.io/articles/best-html-to-pdf-api-services-2026 ;
https://craftmypdf.com/blog/best-pdf-generation-apis-for-html-to-pdf/ ;
https://onesimpleapi.com/best/pdf-apis ;
https://docraptor.com/free-html-to-pdf-api