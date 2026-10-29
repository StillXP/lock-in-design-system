// Checks that each Code Connect template still matches its component spec's `figma.props` rows.
// Only the component's main template is checked (its node-id is the spec's `figma.nodeId`); templates for
// sub-components such as Tab or DropdownItem model properties the spec does not list.
//   - every property the template reads (getEnum / getBoolean / getString / getInstanceSwap) has a row
//   - the Figma type of the call matches the row's `figmaType`
//   - the values a getEnum maps are exactly the row's `figmaValues`
// Layer lookups (findText, findInstance) are not component properties and are ignored.
// Run with: npm run check:figma -w @lockin/specs
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSpecs } from './validate.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const FIGMA_DIR = join(repo, 'packages', 'react', 'figma');

const FIGMA_TYPE = { getEnum: 'VARIANT', getBoolean: 'BOOLEAN', getString: 'TEXT', getInstanceSwap: 'INSTANCE_SWAP' };
const CALL = /\binstance\.(getEnum|getBoolean|getString|getInstanceSwap)\(\s*'([^']+)'(?:\s*,\s*\{([^}]*)\})?/g;

/** Keys of an object literal body such as `primary: 'primary', 'x-y': 'x'`. */
const keysOf = (body) => [...body.matchAll(/(?:^|,)\s*(?:'([^']+)'|"([^"]+)"|([\w-]+))\s*:/g)].map((m) => m[1] ?? m[2] ?? m[3]);

export function templateInfo(text) {
  const component = text.match(/^\/\/ component=(.+)$/m)?.[1].trim();
  const node = text.match(/node-id=(\d+)-(\d+)/);
  return { component, nodeId: node ? `${node[1]}:${node[2]}` : undefined };
}

/** Errors for one template against its spec. */
export function checkTemplate(text, spec) {
  const errors = [];
  const rows = new Map((spec.figma?.props ?? []).filter((r) => r.figma).map((r) => [r.figma, r]));
  for (const [, method, name, body] of text.matchAll(CALL)) {
    const row = rows.get(name);
    if (!row) {
      errors.push(`reads ${method}('${name}') but ${spec.name}'s figma.props has no row for "${name}"`);
      continue;
    }
    if (row.figmaType !== FIGMA_TYPE[method]) {
      errors.push(`${method}('${name}') reads a ${FIGMA_TYPE[method]} property but the spec row says ${row.figmaType}`);
    }
    if (method === 'getEnum' && body !== undefined && row.figmaValues) {
      const used = new Set(keysOf(body));
      const expected = new Set(row.figmaValues.map(String));
      const missing = [...expected].filter((v) => !used.has(v));
      const extra = [...used].filter((v) => !expected.has(v));
      if (missing.length) errors.push(`getEnum('${name}') does not map ${missing.join(', ')}, which the spec lists in figmaValues`);
      if (extra.length) errors.push(`getEnum('${name}') maps ${extra.join(', ')}, which the spec does not list in figmaValues`);
    }
  }
  return errors;
}

export function checkAll() {
  const specs = new Map(loadSpecs().map(({ spec }) => [spec.name, spec]));
  const errors = [];
  for (const file of readdirSync(FIGMA_DIR).filter((f) => f.endsWith('.figma.ts')).sort()) {
    const text = readFileSync(join(FIGMA_DIR, file), 'utf8');
    const { component, nodeId } = templateInfo(text);
    const spec = specs.get(component);
    if (!spec) {
      errors.push(`${file}: no spec named "${component}"`);
      continue;
    }
    if (nodeId !== spec.figma?.nodeId) continue; // sub-component template
    for (const e of checkTemplate(text, spec)) errors.push(`${file}: ${e}`);
  }
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = checkAll();
  if (errors.length) {
    console.error(errors.map((e) => `✖ ${e}`).join('\n'));
    console.error(`\n${errors.length} Code Connect problem(s). Fix the template or the spec's figma.props.`);
    process.exit(1);
  }
  console.log('Code Connect templates match the specs.');
}
