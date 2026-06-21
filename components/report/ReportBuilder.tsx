'use client';

import { useState, useRef, useEffect } from 'react';
import type { OcfDataset } from '@/lib/data/ocf';
import type { ReportOptions } from '@/lib/report/options';
import { OcfReport } from './OcfReport';

type Message = { role: 'user' | 'assistant'; text: string };

const SUGGESTED_PROMPTS = [
  'Show only Scope 3',
  'Switch to Planta Valencia',
  'Top 8 Scope 3 categories',
  'Remove the methodology section',
];

type Props = {
  dataset: OcfDataset;
  initialSpec: ReportOptions;
};

export function ReportBuilder({ dataset, initialSpec }: Props) {
  const [spec, setSpec] = useState<ReportOptions>(initialSpec);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
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
        // Send currentSpec so relative edits ("remove the cover") work off the live state.
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

  const [exporting, setExporting] = useState(false);

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
      a.download = 'relats-ocf-2024.pdf';
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
    <div className="flex h-screen overflow-hidden">
      {/* Chat panel */}
      <div className="flex w-80 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Report Builder</h2>
          <p className="mt-0.5 text-xs text-gray-500">Edit the report with natural language</p>
          <button
            onClick={() => void exportPdf()}
            disabled={exporting}
            className="mt-3 w-full rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-relats-orange hover:text-relats-orange disabled:opacity-50"
          >
            {exporting ? 'Generating PDF…' : 'Export PDF'}
          </button>
        </div>

        {/* Message list */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && !loading && (
            <p className="text-xs text-gray-400">Ask me to adjust the report…</p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
              <span
                className={`inline-block max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-relats-orange text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.text}
              </span>
            </div>
          ))}
          {loading && (
            <div className="text-left">
              <span className="inline-block rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500">
                Thinking…
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts — hidden after first message to keep the panel clean */}
        {showSuggestions && (
          <div className="border-t border-gray-100 px-4 py-3">
            <p className="mb-2 text-xs font-medium text-gray-500">Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => void send(prompt)}
                  disabled={loading}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 transition-colors hover:border-relats-orange hover:text-relats-orange disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-gray-200 p-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. show only Scope 3"
            disabled={loading}
            className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-relats-orange disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-md bg-relats-orange px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-relats-orange-dark disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>

      {/* Live report preview */}
      <div className="flex-1 overflow-y-auto bg-zinc-200 py-8">
        <div className="mx-auto max-w-4xl shadow-lg">
          <OcfReport data={dataset} options={spec} />
        </div>
      </div>
    </div>
  );
}
