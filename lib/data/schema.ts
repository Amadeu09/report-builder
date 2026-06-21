import { z } from 'zod';
import { CATEGORIES, type CategoryKey } from './categories';

// Object.fromEntries loses key specificity; the as unknown as is an internal
// implementation detail of building the shape, not a cast on parsed data.
const categoryShape = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, z.coerce.number().nonnegative()])
) as unknown as Record<CategoryKey, z.ZodTypeAny>;

export const OcfRowSchema = z.object({
  entity: z.string().min(1),
  total_emissions: z.coerce.number().nonnegative(),
  total_scope_1: z.coerce.number().nonnegative(),
  total_scope_2: z.coerce.number().nonnegative(),
  total_scope_3: z.coerce.number().nonnegative(),
  ...categoryShape,
});

export type OcfRow = {
  entity: string;
  total_emissions: number;
  total_scope_1: number;
  total_scope_2: number;
  total_scope_3: number;
} & Record<CategoryKey, number>;

// Compile-time guarantee: the five named scalar fields in the schema output match
// OcfRow. Category fields are dynamically generated from the registry and
// validated at runtime by zod — that is the contract for those fields.
type _NamedFields = Pick<
  z.infer<typeof OcfRowSchema>,
  'entity' | 'total_emissions' | 'total_scope_1' | 'total_scope_2' | 'total_scope_3'
>;
type _AssertNamedFields = _NamedFields extends Pick<
  OcfRow,
  'entity' | 'total_emissions' | 'total_scope_1' | 'total_scope_2' | 'total_scope_3'
>
  ? true
  : never;
const _schemaAssert: _AssertNamedFields = true;
void _schemaAssert;
