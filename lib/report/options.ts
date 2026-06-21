export type SectionId =
  | 'cover'
  | 'intro'
  | 'methodology'
  | 'global-results'
  | 'scope-1'
  | 'scope-2'
  | 'scope-3'
  | 'conclusions';

export type ReportOptions = {
  entity: string;
  scope3TopN: number;
  scope3Sort: 'value-desc' | 'code-asc';
  sections: SectionId[];
};

export const DEFAULT_OPTIONS: ReportOptions = {
  entity: 'Total empresa',
  scope3TopN: 5,
  scope3Sort: 'value-desc',
  sections: [
    'cover',
    'intro',
    'methodology',
    'global-results',
    'scope-1',
    'scope-2',
    'scope-3',
    'conclusions',
  ],
};
