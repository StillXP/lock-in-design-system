// Lock In proposals (LIP): intake requests for new components, variants, tokens, icons, patterns or changes.
// Shared by proposals/validate.mjs (CLI, CI) and the hub (REST + MCP submit_proposal).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { validateSpec } from './validate.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const proposalSchema = JSON.parse(readFileSync(join(root, 'schema', 'proposal.schema.json'), 'utf8'));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateIntake = ajv.compile(proposalSchema);

export const PROPOSAL_ID = /^LIP-(\d{3,})$/;

/**
 * Errors for one proposal: the intake schema, and for component proposals the draft spec
 * (component schema + token names via validateSpec). Pass `tokens` to reuse a loaded token map.
 */
export function validateProposal(proposal, file, tokens) {
  const errors = [];
  if (!validateIntake(proposal)) for (const e of validateIntake.errors) errors.push(`${e.instancePath || '/'} ${e.message}`);
  if (proposal?.intake?.kind === 'component') {
    if (!proposal.spec) errors.push('component proposals need a draft spec');
    else {
      if (proposal.spec.status !== 'experimental') errors.push('draft spec status must be "experimental"');
      errors.push(...validateSpec(proposal.spec, file, tokens).map((e) => `spec: ${e}`));
    }
  }
  return errors;
}

/** Every proposals/*.json file in `dir`, sorted by id. */
export function loadProposals(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ file: join(dir, f), slug: basename(f, '.json'), proposal: JSON.parse(readFileSync(join(dir, f), 'utf8')) }))
    .sort((a, b) => String(a.proposal.intake?.id).localeCompare(String(b.proposal.intake?.id)));
}

/** Next unused LIP number. Ids are never reused, so this is one past the highest ever seen. */
export function nextProposalId(proposals) {
  const max = proposals.reduce((m, p) => Math.max(m, Number(p.intake?.id?.match(PROPOSAL_ID)?.[1] ?? 0)), 0);
  return `LIP-${String(max + 1).padStart(3, '0')}`;
}

// ---------- GitHub issue body ----------
// The hub opens an issue for each proposal it files and embeds the proposal file in the body, so the
// Proposals workflow can turn the issue into a PR without the hub needing write access to the repo.

const EMBED_START = '<!-- lip:proposal';
const EMBED_RE = /<!-- lip:proposal slug=([a-z][a-z0-9-]*) -->\s*```json\n([\s\S]*?)\n```/;

/** Markdown issue body for a proposal, with the proposal file embedded (collapsed) at the end. */
export function proposalIssueBody(proposal, slug) {
  const i = proposal.intake;
  const list = (items) => items.map((x) => `- ${x}`).join('\n') || '- (none)';
  return [
    `**Proposal file:** \`proposals/${slug}.json\` (the Proposals workflow opens a PR with it)`,
    `**Kind:** ${i.kind}   **From:** ${i.submitted.from}   **Submitted:** ${i.submitted.date} by ${i.submitted.by}`,
    i.prototype ? `**Prototype:** ${i.prototype}` : '',
    `### Problem\n${i.problem}`,
    `### Evidence\n${list(i.evidence.map((e) => `**${e.product}**: ${e.link ? `[${e.where}](${e.link})` : e.where}${e.note ? ` · ${e.note}` : ''}`))}`,
    `### Closest existing\n${list(i.closestExisting.map((c) => `**${c.name}**: ${c.whyNotExtend}`))}`,
    `### Open questions\n${list(i.openQuestions)}`,
    `<details><summary>Proposal file (for the workflow, don't edit)</summary>\n\n${EMBED_START} slug=${slug} -->\n\`\`\`json\n${JSON.stringify(proposal, null, 2)}\n\`\`\`\n</details>`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** The proposal embedded by proposalIssueBody, or null when the issue has none (e.g. filed with the form). */
export function proposalFromIssueBody(body) {
  const m = String(body ?? '').match(EMBED_RE);
  if (!m) return null;
  return { slug: m[1], proposal: JSON.parse(m[2]) };
}

/** Duplicate ids across a set of proposals: "LIP-002 is used by a.json and b.json". */
export function duplicateIds(entries) {
  const seen = new Map();
  const errors = [];
  for (const { slug, proposal } of entries) {
    const id = proposal.intake?.id;
    if (!id) continue;
    if (seen.has(id)) errors.push(`${id} is used by ${seen.get(id)}.json and ${slug}.json`);
    else seen.set(id, slug);
  }
  return errors;
}
