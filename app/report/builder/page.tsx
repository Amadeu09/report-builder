import { loadDataset } from '@/lib/data/loadDataset';
import { DEFAULT_OPTIONS } from '@/lib/report/options';
import { ReportBuilder } from '@/components/report/ReportBuilder';

export default function ReportBuilderPage() {
  const { dataset } = loadDataset();

  return <ReportBuilder dataset={dataset} initialSpec={DEFAULT_OPTIONS} />;
}
