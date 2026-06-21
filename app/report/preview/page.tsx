import { loadDataset } from '@/lib/data/loadDataset';
import { OcfReport } from '@/components/report/OcfReport';
import { DEFAULT_OPTIONS } from '@/lib/report/options';

export default function ReportPreviewPage() {
  const { dataset, warnings } = loadDataset();

  return (
    <div className="min-h-screen bg-zinc-200 py-8">
      {warnings.length > 0 && (
        <div className="mx-auto mb-4 max-w-4xl rounded border border-yellow-300 bg-yellow-50 px-4 py-3">
          <p className="text-sm font-medium text-yellow-800">Data warnings</p>
          <ul className="mt-1 list-inside list-disc text-xs text-yellow-700">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mx-auto max-w-4xl shadow-lg">
        <OcfReport data={dataset} options={DEFAULT_OPTIONS} />
      </div>
    </div>
  );
}
