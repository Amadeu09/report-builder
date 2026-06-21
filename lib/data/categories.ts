export const CATEGORIES = [
  { key: 'scope_1_1_stationary_combustion',                    code: '1.1',   scope: 1, label: 'Stationary combustion' },
  { key: 'scope_1_2_mobile_combustion',                        code: '1.2',   scope: 1, label: 'Mobile combustion' },
  { key: 'scope_1_3_process_emissions',                        code: '1.3',   scope: 1, label: 'Process emissions' },
  { key: 'scope_1_4_1_refrigerant_gases',                      code: '1.4.1', scope: 1, label: 'Refrigerant gases' },
  { key: 'scope_1_4_2_fire_extinguishers',                     code: '1.4.2', scope: 1, label: 'Fire extinguishers' },
  { key: 'scope_2_1_1_purchased_electricity',                  code: '2.1.1', scope: 2, label: 'Purchased electricity' },
  { key: 'scope_2_1_2_purchased_heat_or_steam',                code: '2.1.2', scope: 2, label: 'Purchased heat or steam' },
  { key: 'scope_3_1_1_raw_materials_or_auxiliary_materials',   code: '3.1.1', scope: 3, label: 'Raw & auxiliary materials' },
  { key: 'scope_3_1_2_water_consumption',                      code: '3.1.2', scope: 3, label: 'Water consumption' },
  { key: 'scope_3_1_3_services',                               code: '3.1.3', scope: 3, label: 'Services' },
  { key: 'scope_3_2_capital_fixed_assets',                     code: '3.2',   scope: 3, label: 'Capital / fixed assets' },
  { key: 'scope_3_3_fuel_and_energy_related_activities',       code: '3.3',   scope: 3, label: 'Fuel & energy related activities' },
  { key: 'scope_3_4_upstream_transport_and_distribution',      code: '3.4',   scope: 3, label: 'Upstream transport & distribution' },
  { key: 'scope_3_5_waste_generated_in_operations',            code: '3.5',   scope: 3, label: 'Waste generated in operations' },
  { key: 'scope_3_6_business_travel',                          code: '3.6',   scope: 3, label: 'Business travel' },
  { key: 'scope_3_7_employee_commuting',                       code: '3.7',   scope: 3, label: 'Employee commuting' },
  { key: 'scope_3_8_upstream_leased_assets',                   code: '3.8',   scope: 3, label: 'Upstream leased assets' },
  { key: 'scope_3_9_downstream_transport_and_distribution',    code: '3.9',   scope: 3, label: 'Downstream transport & distribution' },
  { key: 'scope_3_10_processing_of_sold_products',             code: '3.10',  scope: 3, label: 'Processing of sold products' },
  { key: 'scope_3_11_use_of_sold_products',                    code: '3.11',  scope: 3, label: 'Use of sold products' },
  { key: 'scope_3_12_end_of_life_treatment_of_sold_products',  code: '3.12',  scope: 3, label: 'End-of-life treatment of sold products' },
  { key: 'scope_3_13_downstream_leased_assets',                code: '3.13',  scope: 3, label: 'Downstream leased assets' },
  { key: 'scope_3_14_franchises',                              code: '3.14',  scope: 3, label: 'Franchises' },
  { key: 'scope_3_15_investments',                             code: '3.15',  scope: 3, label: 'Investments' },
] as const;

export const AGGREGATE_ENTITY_NAME = 'Total empresa' as const;

export type CategoryKey = typeof CATEGORIES[number]['key'];
export type ScopeNumber = typeof CATEGORIES[number]['scope'];

export const SCOPE_TOTAL_KEYS: Record<ScopeNumber, string> = {
  1: 'total_scope_1',
  2: 'total_scope_2',
  3: 'total_scope_3',
};

export const SCOPE_LABELS: Record<ScopeNumber, string> = {
  1: 'Scope 1: Direct Emissions',
  2: 'Scope 2: Indirect Energy Emissions',
  3: 'Scope 3: Value Chain Emissions',
};

export const CATEGORY_BY_KEY = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c])
) as Record<CategoryKey, typeof CATEGORIES[number]>;
