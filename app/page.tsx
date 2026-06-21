import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-md text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate">
          Footprint Mappa
        </p>
        <h1 className="mb-3 text-3xl font-bold text-ink">
          Relats Carbon Report Builder
        </h1>
        <p className="mb-8 text-sm text-slate">
          Generate and customise an Organisational Carbon Footprint report for
          Relats. Edit sections, entities and scope filters with natural language
          — export to PDF in one click.
        </p>
        <Link
          href="/report/builder"
          className="inline-block rounded-md bg-relats-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-relats-orange-dark"
        >
          Open Report Builder →
        </Link>
        <p className="mt-4 text-xs text-slate">
          or{' '}
          <Link
            href="/report/preview"
            className="underline underline-offset-2 hover:text-relats-orange"
          >
            view the static report
          </Link>
        </p>
      </div>
    </main>
  );
}
