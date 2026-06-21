import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ReportSpecSchema, mergeSpec } from '@/lib/spec';
import { DEFAULT_OPTIONS } from '@/lib/report/options';
import { loadDataset } from '@/lib/data/loadDataset';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SECTION_IDS = [
  'cover',
  'intro',
  'methodology',
  'global-results',
  'scope-1',
  'scope-2',
  'scope-3',
  'conclusions',
] as const;

const RequestBodySchema = z.object({
  instruction: z.string().min(1),
  currentSpec: ReportSpecSchema.optional(),
});

export async function POST(req: NextRequest) {
  // Parse + validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = RequestBodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Bad request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { instruction, currentSpec = DEFAULT_OPTIONS } = parsed.data;

  // Ground valid entity names from the actual dataset
  const { dataset } = loadDataset();
  const validEntities = [
    dataset.aggregate.name,
    ...dataset.plants.map((p) => p.name),
  ];

  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

  const systemPrompt = `You are a report configuration assistant. Update the report spec based on the user's instruction.

Current spec:
- entity: "${currentSpec.entity}"
- sections (in order): ${JSON.stringify(currentSpec.sections)}
- scope3TopN: ${currentSpec.scope3TopN}
- scope3Sort: "${currentSpec.scope3Sort}"

Valid entities: ${validEntities.map((e) => `"${e}"`).join(', ')}
Valid sections: ${SECTION_IDS.map((s) => `"${s}"`).join(', ')}
scope3TopN range: 1–17 (how many Scope 3 categories to show before collapsing the rest into "Other")
scope3Sort: "value-desc" (largest first) or "code-asc" (by category code)

Rules:
- Only return fields that need to change. Omit fields that stay the same.
- For section reorders or removals, return the FULL desired sections array (not a diff).
- "cover" and "conclusions" must ALWAYS be included in sections unless the user explicitly asks to remove one of them. Scope or section filters ("show only Scope 3", "show Scope 1 and 2") affect body sections only — always prepend "cover" and append "conclusions".
- Only use valid entity names and section IDs listed above. If the user requests an unknown entity, do not call the tool — the request will be rejected downstream.`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: instruction }],
      tool_choice: { type: 'tool', name: 'set_report_spec' },
      tools: [
        {
          name: 'set_report_spec',
          description:
            'Update any subset of the report configuration. Only include fields that should change.',
          input_schema: {
            type: 'object' as const,
            properties: {
              entity: {
                type: 'string',
                enum: validEntities,
                description: 'Which entity to feature in the report.',
              },
              sections: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: SECTION_IDS,
                },
                description: 'Full ordered list of sections to include.',
              },
              scope3TopN: {
                type: 'integer',
                minimum: 1,
                maximum: 17,
                description:
                  'How many Scope 3 categories to show before collapsing the rest into "Other".',
              },
              scope3Sort: {
                type: 'string',
                enum: ['value-desc', 'code-asc'],
                description: 'Sort order for Scope 3 categories.',
              },
            },
            additionalProperties: false,
          },
        },
      ],
    });

    // Extract tool_use block (forced, so always present)
    const toolBlock = response.content.find((b) => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      return Response.json(
        { error: 'Model did not return a tool call' },
        { status: 502 },
      );
    }

    // Validate the partial spec
    const partialParse = ReportSpecSchema.partial().safeParse(toolBlock.input);
    if (!partialParse.success) {
      return Response.json(
        { error: 'Model returned invalid spec fields', details: partialParse.error.flatten() },
        { status: 502 },
      );
    }

    // Merge with current spec and validate the full result
    const merged = mergeSpec(currentSpec, partialParse.data);
    const fullParse = ReportSpecSchema.safeParse(merged);
    if (!fullParse.success) {
      return Response.json(
        { error: 'Merged spec failed validation', details: fullParse.error.flatten() },
        { status: 422 },
      );
    }

    // Entity must be one the dataset actually contains
    if (!validEntities.includes(fullParse.data.entity)) {
      return Response.json(
        {
          error: `Unknown entity "${fullParse.data.entity}". Valid: ${validEntities.join(', ')}`,
        },
        { status: 422 },
      );
    }

    return Response.json({ spec: fullParse.data });
  } catch (err) {
    // Never leak the API key; log server-side only
    console.error('[generate-spec] Anthropic API error:', err);
    return Response.json({ error: 'Upstream API error' }, { status: 502 });
  }
}
