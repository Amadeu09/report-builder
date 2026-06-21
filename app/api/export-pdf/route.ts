import { chromium } from 'playwright';
import { ReportSpecSchema } from '@/lib/spec';
import { DEFAULT_OPTIONS } from '@/lib/report/options';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin;

  // Read spec from body; fall back to DEFAULT_OPTIONS if absent or invalid.
  let specQuery = '';
  try {
    const body = (await request.json()) as { spec?: unknown };
    const result = ReportSpecSchema.safeParse(body.spec);
    if (result.success) {
      specQuery = '?spec=' + encodeURIComponent(JSON.stringify(result.data));
    }
  } catch {
    // no body or non-JSON — use defaults
  }

  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();

    // networkidle ensures Inter webfont finishes loading before capture.
    await page.goto(`${origin}/report/print${specQuery}`, { waitUntil: 'networkidle' });

    // preferCSSPageSize: @page in print.css owns size + margins.
    // printBackground: required for Relats orange fills and surface backgrounds.
    // Do NOT pass format or margin here — they would override the @page rules
    // and cause double margins (see app/report/print/print.css).
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });

    return new Response(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="relats-ocf-2024.pdf"',
      },
    });
  } catch (err) {
    console.error('[export-pdf]', err);
    return new Response('PDF generation failed', { status: 500 });
  } finally {
    await browser.close();
  }
}
