import { loadDataset } from '@/lib/data/loadDataset';
import { OcfReport } from '@/components/report/OcfReport';
import { DEFAULT_OPTIONS } from '@/lib/report/options';
import { ReportSpecSchema } from '@/lib/spec';

type Props = {
  searchParams: Promise<{ spec?: string }>;
};

export default async function ReportPrintPage({ searchParams }: Props) {
  const { dataset } = loadDataset();
  const { spec: rawSpec } = await searchParams;

  let options = DEFAULT_OPTIONS;
  if (rawSpec) {
    try {
      const result = ReportSpecSchema.safeParse(JSON.parse(decodeURIComponent(rawSpec)));
      if (result.success) options = result.data;
    } catch {
      // malformed query param — fall back to DEFAULT_OPTIONS
    }
  }

  return (
    <div className="report-print bg-white w-full">
      <OcfReport data={dataset} options={options} />
    </div>
  );
}
