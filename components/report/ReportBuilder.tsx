'use client';

import { useState, useRef, useEffect } from 'react';
import type { OcfDataset } from '@/lib/data/ocf';
import type { ReportOptions } from '@/lib/report/options';
import { OcfReport } from './OcfReport';
import { GrainGradient } from '@/components/ui/GrainGradient';
import { AppHeader } from '@/components/ui/AppHeader';

type Message = { role: 'user' | 'assistant'; text: string };

const SUGGESTED_PROMPTS = [
  'Show only Scope 3',
  'Switch to Planta Valencia',
  'Top 8 Scope 3 categories',
  'Remove the methodology section',
];

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

type Props = {
  dataset: OcfDataset;
  initialSpec: ReportOptions;
};

export function ReportBuilder({ dataset, initialSpec }: Props) {
  const [spec, setSpec] = useState<ReportOptions>(initialSpec);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [exporting, setExporting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(instruction: string) {
    const text = instruction.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);
    setInput('');

    try {
      const res = await fetch('/api/generate-spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: text, currentSpec: spec }),
      });

      const data = (await res.json()) as { spec?: ReportOptions; error?: string };

      if (res.ok && data.spec) {
        setSpec(data.spec);
        setMessages((prev) => [...prev, { role: 'assistant', text: 'Report updated.' }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `Sorry, I couldn't apply that — ${data.error ?? 'unknown error'}`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(input);
  }

  async function exportPdf() {
    setExporting(true);
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
      setExporting(false);
    }
  }

  const showSuggestions = messages.length === 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-app-ink">
      <AppHeader title="Report Builder" />

      <div className="flex flex-1 overflow-hidden">
      {/* ── Sidebar ── */}
      <GrainGradient
        variant="dark"
        muted
        className={`flex flex-shrink-0 flex-col border-r border-white/10 transition-[width] duration-200 ${
          sidebarOpen ? 'w-80' : 'w-10'
        }`}
        contentClassName="flex flex-col flex-1 overflow-hidden"
      >
        {/* Toggle strip — always visible */}
        <div
          className={`flex flex-shrink-0 items-center border-b border-white/10 ${
            sidebarOpen ? 'justify-between px-4 py-3' : 'justify-center py-3'
          }`}
        >
          {sidebarOpen && (
            <span className="text-xs tracking-[0.12em] text-white/50 uppercase">AI Assistant</span>
          )}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'Hide panel' : 'Show panel'}
            className="flex-shrink-0 p-1.5 text-white/60 transition-colors hover:text-white"
          >
            <MenuIcon rotated={!sidebarOpen} />
          </button>
        </div>

        {/* Collapsible content */}
        {sidebarOpen && (
          <>
            {/* Export button */}
            <div className="border-b border-white/10 px-4 py-3">
              <button
                onClick={() => void exportPdf()}
                disabled={exporting}
                className="w-full border border-white/20 px-3 py-2 text-xs font-normal tracking-wide text-white/70 transition-colors hover:border-white hover:text-white disabled:opacity-40"
              >
                {exporting ? 'Generating PDF…' : 'Export PDF'}
              </button>
            </div>

            {/* Message list */}
            <div
              className={`flex flex-1 flex-col overflow-y-auto p-4 ${
                messages.length === 0 && !loading
                  ? 'items-center justify-center'
                  : 'space-y-3'
              }`}
            >
              {messages.length === 0 && !loading && (
                <p className="text-xs text-white/50">Ask me to adjust the report…</p>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                  {msg.role === 'user' ? (
                    <span className="inline-block max-w-[90%] bg-white px-3 py-2 text-sm text-app-ink">
                      {msg.text}
                    </span>
                  ) : (
                    <span className="inline-block max-w-[90%] border border-white/20 px-3 py-2 text-sm text-white/70">
                      {msg.text}
                    </span>
                  )}
                </div>
              ))}
              {loading && (
                <div className="text-left">
                  <span className="inline-block border border-white/20 px-3 py-2 text-sm text-white/60">
                    Thinking…
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts */}
            {showSuggestions && (
              <div className="border-t border-white/10 px-4 py-3">
                <p className="mb-2 text-xs tracking-wide text-white/50 uppercase">Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => void send(prompt)}
                      disabled={loading}
                      className="border border-white/20 px-3 py-1 text-xs text-white/60 transition-colors hover:border-white hover:text-white disabled:opacity-40"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex flex-shrink-0 border-t border-white/10">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. show only Scope 3"
                disabled={loading}
                autoComplete="off"
                className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-white/30 outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="border-l border-white/10 bg-white px-4 py-3 text-sm font-bold text-app-ink transition-opacity hover:opacity-80 disabled:opacity-30"
              >
                →
              </button>
            </form>
          </>
        )}
      </GrainGradient>

      {/* ── Report preview ── */}
      <div className="flex-1 overflow-y-auto bg-neutral-300 py-8">
        <div className="mx-auto max-w-4xl" style={{ boxShadow: '4px 4px 0px 0px rgba(255,255,255,0.08)' }}>
          <OcfReport data={dataset} options={spec} />
        </div>
      </div>
      </div>
    </div>
  );
}
