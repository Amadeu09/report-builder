import Link from 'next/link';

type Props = { title: string };

export function AppHeader({ title }: Props) {
  return (
    <header className="flex flex-shrink-0 items-center gap-3 border-b border-white/10 bg-app-ink px-4 py-4">
      <Link
        href="/"
        aria-label="Back to menu"
        className="flex items-center text-white/60 transition-colors hover:text-white"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M10.5 3L5.5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </Link>
      <div className="h-4 w-px bg-white/20" />
      <span className="text-sm font-bold text-white">{title}</span>
    </header>
  );
}
