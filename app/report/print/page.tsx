import { loadDataset } from '@/lib/data/loadDataset';
import { OcfReport } from '@/components/report/OcfReport';
import { DEFAULT_OPTIONS } from '@/lib/report/options';

export default function ReportPrintPage() {
  const { dataset } = loadDataset();

  return (
    <div className="report-print bg-white w-full">
      <OcfReport data={dataset} options={DEFAULT_OPTIONS} />
    </div>
  );
}
