// Validates every proposal in proposals/*.json (or the files given):
// the intake against packages/specs/schema/proposal.schema.json, the draft spec of component
// proposals with the same rules as packages/specs, that no two proposals share an id, and that released component
// proposals are in the Figma library as well as in code (spec figma node, Props table, Code Connect template).
// Usage: node proposals/validate.mjs [file ...]
import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { duplicateIds, loadProposals, releaseGaps, validateProposal } from '@stillxp/specs/proposals';

const dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(dir, '..');
const args = process.argv.slice(2);
const entries = args.length
  ? args.map((file) => ({ file, slug: basename(file, '.json'), proposal: JSON.parse(readFileSync(file, 'utf8')) }))
  : loadProposals(dir);

let failed = 0;
for (const { file, slug, proposal } of entries) {
  const errors = validateProposal(proposal, file);
  if (proposal.intake?.status === 'released') errors.push(...releaseGaps(proposal, slug, repoRoot).map((g) => `released, but ${g}`));
  if (errors.length) {
    failed++;
    console.error(`✗ ${basename(file)}\n  ${errors.join('\n  ')}`);
  } else console.log(`✓ ${basename(file)} (${proposal.intake.id}, ${proposal.intake.status})`);
}
for (const e of duplicateIds(entries)) {
  failed++;
  console.error(`✗ ${e}`);
}
process.exit(failed ? 1 : 0);
