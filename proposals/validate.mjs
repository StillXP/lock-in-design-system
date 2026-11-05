// Validates every proposal in proposals/*.json (or the files given):
// the intake against packages/specs/schema/proposal.schema.json, the draft spec of component
// proposals with the same rules as packages/specs, and that no two proposals share an id.
// Usage: node proposals/validate.mjs [file ...]
import { readFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { duplicateIds, loadProposals, validateProposal } from '@stillxp/specs/proposals';

const dir = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const entries = args.length
  ? args.map((file) => ({ file, slug: basename(file, '.json'), proposal: JSON.parse(readFileSync(file, 'utf8')) }))
  : loadProposals(dir);

let failed = 0;
for (const { file, proposal } of entries) {
  const errors = validateProposal(proposal, file);
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
