// Concatenate base styles + every component stylesheet into dist/styles.css.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const componentsDir = join(root, 'src', 'components');
const parts = [join(root, 'src', 'styles', 'base.css')];
for (const name of readdirSync(componentsDir).sort()) {
  const file = join(componentsDir, name, `${name}.css`);
  if (existsSync(file)) parts.push(file);
}
mkdirSync(join(root, 'dist'), { recursive: true });
const css = parts.map((f) => `/* ${f.slice(root.length + 1).replace(/\\/g, '/')} */\n${readFileSync(f, 'utf8')}`).join('\n');
writeFileSync(join(root, 'dist', 'styles.css'), `/* @lockin/react — generated. Import after @lockin/tokens/css. */\n${css}`);
console.log(`✓ Bundled ${parts.length} stylesheets → dist/styles.css`);
