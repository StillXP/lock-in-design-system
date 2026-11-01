// Validates every proposal in proposals/*.json:
// - the intake block against proposals/proposal.schema.json
// - the draft spec (component proposals) with the same rules as packages/specs (schema + token names)
// Usage: node proposals/validate.mjs [file ...]
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { validateSpec } from '@lockin/specs/validate';

const dir = dirname(fileURLToPath(import.meta.url));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateProposal = ajv.compile(JSON.parse(readFileSync(join(dir, 'proposal.schema.json'), 'utf8')));

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'proposal.schema.json').map((f) => join(dir, f));

const ids = new Map();
let failed = 0;
for (const file of files) {
  const p = JSON.parse(readFileSync(file, 'utf8'));
  const errors = [];
  if (!validateProposal(p)) for (const e of validateProposal.errors) errors.push(`${e.instancePath || '/'} ${e.message}`);
  const id = p.intake?.id;
  if (id && ids.has(id)) errors.push(`id ${id} is also used by ${ids.get(id)}`);
  if (id) ids.set(id, basename(file));
  if (p.intake?.kind === 'component') {
    if (!p.spec) errors.push('component proposals need a draft spec');
    else {
      if (p.spec.status !== 'experimental') errors.push('draft spec status must be "experimental"');
      errors.push(...validateSpec(p.spec, file).map((e) => `spec: ${e}`));
    }
  }
  if (errors.length) { failed++; console.error(`✗ ${basename(file)}\n  ${errors.join('\n  ')}`); }
  else console.log(`✓ ${basename(file)} (${id}, ${p.intake.status})`);
}
process.exit(failed ? 1 : 0);
