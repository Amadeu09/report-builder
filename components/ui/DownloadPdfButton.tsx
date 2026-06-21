'use client';

import { useState } from 'react';
import type { ReportOptions } from '@/lib/report/options';

type Props = { spec: ReportOptions };

export function DownloadPdfButton({ spec }: Props) {
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spec }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relats-ocf.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('PDF export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={() => void download()}
      disabled={loading}
      className="w-full border border-white/20 px-3 py-2 text-xs text-white/70 transition-colors hover:border-white hover:text-white disabled:opacity-40"
    >
      {loading ? 'Generating…' : 'Export PDF'}
    </button>
  );
}
