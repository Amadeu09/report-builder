import { loadDataset } from '@/lib/data/loadDataset';
import { OcfReport } from '@/components/report/OcfReport';
import { DEFAULT_OPTIONS } from '@/lib/report/options';
import { AppHeader } from '@/components/ui/AppHeader';
import { PreviewSidenav } from '@/components/ui/PreviewSidenav';

export default function ReportPreviewPage() {
  const { dataset, warnings } = loadDataset();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-app-ink">
      <AppHeader title="Report Preview" />

      <div className="flex flex-1 overflow-hidden">
        <PreviewSidenav spec={DEFAULT_OPTIONS} />

        {/* Report */}
        <div className="flex-1 overflow-y-auto bg-neutral-300 py-8">
          {warnings.length > 0 && (
            <div className="mx-auto mb-4 max-w-4xl border border-white/20 bg-app-paper px-4 py-3">
              <p className="text-sm font-bold text-app-ink">Data warnings</p>
              <ul className="mt-1 list-inside list-disc text-xs text-app-muted">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mx-auto max-w-4xl" style={{ boxShadow: '4px 4px 0px 0px rgba(255,255,255,0.08)' }}>
            <OcfReport data={dataset} options={DEFAULT_OPTIONS} />
          </div>
        </div>
      </div>
    </div>
  );
}
