import { z } from 'zod';

/** Input shapes for filing proposals, shared by REST and MCP. The hub sets id, status and submitted itself. */

export const evidenceItem = z.object({
  product: z.string().min(1).describe('Product or repo, e.g. "VolleyXP"'),
  where: z.string().min(1).describe('Screen, flow or file where the need shows up'),
  link: z.string().optional().describe('Figma node URL, code path or page URL'),
  note: z.string().optional(),
});

export const submitProposalShape = {
  title: z.string().min(3).max(120).describe('Short title, e.g. "Stepper: progress through a multi-step flow"'),
  kind: z.enum(['component', 'variant', 'token', 'icon', 'pattern', 'change']).describe('component: new component. variant: new variant/prop on an existing one. token, icon, pattern, or change (fix to something that exists).'),
  from: z.string().min(1).describe('Product or repo where the need came up'),
  problem: z.string().min(20).describe('Why it is needed, in plain words: the user or product problem'),
  evidence: z.array(evidenceItem).min(1).describe('Every place that needs it today. Reuse across products weighs most in triage.'),
  closestExisting: z.array(z.object({ name: z.string(), whyNotExtend: z.string() })).describe('Closest Lock In components/tokens and why extending them is not enough. Empty if nothing comes close.'),
  standIn: z.object({ description: z.string().optional(), figma: z.string().optional(), code: z.string().optional() }).optional().describe('What the product uses meanwhile'),
  figmaApi: z
    .array(z.object({ property: z.string(), type: z.enum(['VARIANT', 'BOOLEAN', 'TEXT', 'INSTANCE_SWAP']), values: z.array(z.string()).optional(), default: z.union([z.string(), z.boolean()]).optional(), mapsTo: z.string().optional() }))
    .optional()
    .describe('Proposed Figma component properties'),
  contrast: z.array(z.object({ foreground: z.string(), background: z.string(), ratio: z.number(), passes: z.string() })).optional().describe('New color pairings checked with check_contrast'),
  openQuestions: z.array(z.string()).optional(),
  prototype: z.string().optional().describe('Link to an interactive prototype'),
  slug: z.string().optional().describe('File name (lowercase-dashes). Defaults to spec.slug or the title.'),
  onBehalfOf: z.string().optional().describe('The person you are filing for, when you are an agent'),
  spec: z
    .record(z.string(), z.unknown())
    .optional()
    .describe('Draft component spec (same shape as get_component, status "experimental"). Required when kind is "component".'),
};

export const submitProposalBody = z.object(submitProposalShape);
export const evidenceBody = z.object({ evidence: z.array(evidenceItem).min(1) });
