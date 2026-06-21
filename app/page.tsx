import Link from 'next/link';
import Image from 'next/image';
import { GrainGradient } from '@/components/ui/GrainGradient';

export default function Home() {
  return (
    <GrainGradient variant="dark" className="min-h-screen">
      {/* Brand chrome */}
      <header className="flex items-center justify-between px-6 pt-6">
        <Image
          src="/logo-Mappa.png"
          alt="Mappa"
          height={20}
          width={80}
          className="brightness-0 invert opacity-70"
        />
        <span className="text-xs font-normal tracking-[0.12em] text-white/70 uppercase">
          Elisava
        </span>
      </header>

      <main className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          {/* Single white card — eyebrow + title + body in one frame */}
          <div className="bg-app-paper px-10 py-10">
            <p className="mb-4 text-xs font-normal tracking-[0.14em] text-app-muted uppercase">
              Carbon Report Builder
            </p>
            <h1 className="mb-5 text-4xl font-bold leading-tight text-app-ink">
              Relats
              <br />
              OCF
            </h1>
            <p className="max-w-[46ch] text-base leading-relaxed text-app-ink">
              Organisational Carbon Footprint report. Edit sections, entities
              and scope filters with natural language — export to PDF in one
              click.
            </p>
          </div>

          {/* CTAs — outside the card, below */}
          <div className="mt-5 flex flex-col gap-3">
            <Link
              href="/report/builder"
              className="block bg-app-ink px-6 py-3 text-center text-sm font-bold text-white transition-opacity hover:opacity-80"
            >
              Open Report Builder →
            </Link>
            <Link
              href="/report/preview"
              className="block border border-white/30 px-6 py-3 text-center text-sm font-normal text-white transition-colors hover:border-white hover:bg-white/10"
            >
              View static report
            </Link>
          </div>
        </div>
      </main>
    </GrainGradient>
  );
}
