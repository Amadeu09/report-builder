'use client';

import { useState } from 'react';
import type { ReportOptions } from '@/lib/report/options';
import { GrainGradient } from './GrainGradient';
import { DownloadPdfButton } from './DownloadPdfButton';

function MenuIcon({ rotated }: { rotated: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`transition-transform duration-200 ${rotated ? 'rotate-90' : ''}`}
    >
      <rect x="1" y="3"    width="14" height="1.5" rx="0.75" />
      <rect x="1" y="7.25" width="14" height="1.5" rx="0.75" />
      <rect x="1" y="11.5" width="14" height="1.5" rx="0.75" />
    </svg>
  );
}

const SECTIONS = [
  { id: 'cover',          label: 'Cover' },
  { id: 'intro',          label: 'Introduction' },
  { id: 'methodology',    label: 'Methodology' },
  { id: 'global-results', label: 'Global results' },
  { id: 'scope-1',        label: 'Scope 1' },
  { id: 'scope-2',        label: 'Scope 2' },
  { id: 'scope-3',        label: 'Scope 3' },
  { id: 'conclusions',    label: 'Conclusions' },
];

type Props = { spec: ReportOptions };

export function PreviewSidenav({ spec }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <GrainGradient
      variant="dark"
      className={`flex-shrink-0 border-r border-white/10 transition-[width] duration-200 ${
        open ? 'w-80' : 'w-10'
      }`}
      contentClassName="flex flex-col flex-1 overflow-hidden"
    >
      {/* Toggle strip */}
      <div
        className={`flex flex-shrink-0 items-center border-b border-white/10 ${
          open ? 'justify-between px-4 py-3' : 'justify-center py-3'
        }`}
      >
        {open && (
          <span className="text-xs tracking-[0.12em] text-white/50 uppercase">Sections</span>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Hide panel' : 'Show panel'}
          className="p-1.5 text-white/60 transition-colors hover:text-white"
        >
          <MenuIcon rotated={!open} />
        </button>
      </div>

      {open && (
        <>
          <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 py-4">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block px-2 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="border-t border-white/10 px-4 py-4">
            <DownloadPdfButton spec={spec} />
          </div>
        </>
      )}
    </GrainGradient>
  );
}
