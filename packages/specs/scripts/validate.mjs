// Validates every component spec against the JSON Schema and checks that each
// referenced token exists. Also builds dist/ (aggregated index for consumers).
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import { loadTokens } from '@lockin/tokens/lib/resolve';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(readFileSync(join(root, 'schema', 'component.schema.json'), 'utf8'));
const validate = new Ajv2020({ allErrors: true, strict: false }).compile(schema);


export function loadSpecs() {
  const dir = join(root, 'components');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => ({ file: f, spec: JSON.parse(readFileSync(join(dir, f), 'utf8')) }));
}

export function validateSpec(spec, file, tokens = loadTokens()) {
  const errors = [];
  if (!validate(spec)) {
    for (const e of validate.errors) errors.push(`${e.instancePath || '/'} ${e.message}`);
  }
  if (file && spec.slug && basename(file, '.json') !== spec.slug) errors.push(`slug "${spec.slug}" must match filename`);
  for (const t of spec.tokens ?? []) {
    if (!tokens.has(t.token)) errors.push(`unknown token "${t.token}"`);
  }
  return errors;
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/validate.mjs')) {
  const specs = loadSpecs();
  let failed = 0;
  for (const { file, spec } of specs) {
    const errors = validateSpec(spec, file);
    if (errors.length) {
      failed++;
      console.error(`✗ ${file}\n  - ${errors.join('\n  - ')}`);
    }
  }
  if (failed) {
    console.error(`${failed}/${specs.length} specs invalid.`);
    process.exit(1);
  }
  console.log(`✓ ${specs.length} component specs valid.`);

  if (process.argv.includes('--build')) {
    mkdirSync(join(root, 'dist'), { recursive: true });
    const all = specs.map((s) => s.spec);
    writeFileSync(join(root, 'dist', 'components.json'), JSON.stringify(all, null, 2));
    writeFileSync(join(root, 'dist', 'index.js'), `export const components = ${JSON.stringify(all, null, 2)};\n`);
    writeFileSync(
      join(root, 'dist', 'index.d.ts'),
      `export interface ComponentSpec { name: string; slug: string; import: { web: string; native: string }; figma?: { fileKey: string; nodeId: string }; status: 'experimental' | 'beta' | 'stable' | 'deprecated'; version: string; category: string; level: 'atom' | 'molecule' | 'organism'; purpose: string; props: Array<{ name: string; type: string; default?: unknown; required: boolean; description: string; platforms?: Array<'web' | 'native'> }>; states: Array<{ name: string; description: string }>; tokens: Array<{ token: string; usage: string }>; accessibility: { role: string; keyboard: Array<{ keys: string; action: string }>; screenReader: string[]; focus: string; touchTarget?: string; wcag: string[]; notes?: string[] }; variants: Array<{ name: string; description: string; useWhen?: string }>; usage: { do: string[]; dont: string[]; related: Array<{ name: string; reason: string }>; example: { web: string; native: string } } }\nexport declare const components: ComponentSpec[];\n`,
    );
    console.log('✓ Wrote dist/components.json');
  }
}
