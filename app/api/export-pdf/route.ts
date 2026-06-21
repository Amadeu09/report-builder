import { chromium } from 'playwright';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin;
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();

    // networkidle ensures Inter webfont finishes loading before capture.
    await page.goto(`${origin}/report/print`, { waitUntil: 'networkidle' });

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
