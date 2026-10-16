// Generates .design-sync/docs/<Name>.md from packages/specs/components/*.json so each component's
// synced .prompt.md carries the spec's JSX example, do/don't, related components and keyboard notes
// instead of raw Storybook story code. Deterministic; run by cfg.buildCmd before every converter run.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const specDir = join(root, 'packages/specs/components');
const outDir = join(root, '.design-sync/docs');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const bullets = (xs) => xs.map((x) => `- ${x}`).join('\n');

for (const f of readdirSync(specDir).filter((n) => n.endsWith('.json')).sort()) {
  const s = JSON.parse(readFileSync(join(specDir, f), 'utf8'));
  const name = /import\s*\{\s*([A-Za-z]+)/.exec(s.import?.web ?? '')?.[1];
  if (!name) throw new Error(`${f}: cannot derive export name from import.web`);
  const u = s.usage ?? {};
  const a = s.accessibility ?? {};
  const out = [`${s.purpose}\n`, `Atomic level: ${s.level}.\n`];
  if (s.variants?.length) {
    out.push('## Variants\n', bullets(s.variants.map((v) => `\`${v.name}\`: ${v.description}${v.useWhen ? ` Use when: ${v.useWhen}` : ''}`)), '');
  }
  if (u.example?.web) out.push('## Example\n', '```jsx', u.example.web, '```', '');
  if (u.do?.length) out.push('## Do\n', bullets(u.do), '');
  if (u.dont?.length) out.push("## Don't\n", bullets(u.dont), '');
  if (u.related?.length) out.push('## Related components\n', bullets(u.related.map((r) => `\`${r.name}\`: ${r.reason}`)), '');
  const acc = [];
  if (a.role) acc.push(`Role: \`${a.role}\`.`);
  if (a.keyboard?.length) acc.push(`Keyboard: ${a.keyboard.map((k) => `${k.keys} ${k.action}`).join('; ')}.`);
  if (a.focus) acc.push(`Focus: ${a.focus}`);
  if (a.notes?.length) acc.push(...a.notes);
  if (acc.length) out.push('## Accessibility\n', bullets(acc), '');
  writeFileSync(join(outDir, `${name}.md`), out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n');
}
console.log(`gen-docs: wrote ${readdirSync(outDir).length} docs`);
