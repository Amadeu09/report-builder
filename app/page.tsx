import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Report Builder</h1>
      <Link
        href="/report/preview"
        className="rounded bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:opacity-80"
      >
        View OCF Report →
      </Link>
    </main>
  );
}
