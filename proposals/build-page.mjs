// Builds the shareable prototype page for a proposal.
// Inlines the arena theme tokens, Lock In's shared field CSS and the proposal JSON
// into proposals/page/<slug>.html, so the page renders the real system.
// Usage: node proposals/build-page.mjs <slug> [outFile]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const repo = join(dir, '..');
const slug = process.argv[2];
if (!slug) { console.error('usage: node proposals/build-page.mjs <slug> [outFile]'); process.exit(1); }
const out = process.argv[3] ?? join(dir, 'dist', `${slug}.html`);

const proposal = JSON.parse(readFileSync(join(dir, `${slug}.json`), 'utf8'));
const tokens = readFileSync(join(repo, 'packages/tokens/dist/css/themes/arena.css'), 'utf8')
  .replace(/@font-face\s*{[^}]*}\s*/g, ''); // fonts load from Google Fonts in the page
const base = readFileSync(join(repo, 'packages/react/src/styles/base.css'), 'utf8');
const html = readFileSync(join(dir, 'page', `${slug}.html`), 'utf8')
  .replace('/*__TOKENS__*/', () => tokens)
  .replace('/*__BASE__*/', () => base)
  .replace('/*__PROPOSAL__*/', () => JSON.stringify(proposal).replace(/</g, '\u003c'));
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
