// Builds the shareable prototype page for a proposal as one static HTML file you can host anywhere.
// Inlines the arena theme tokens, Lock In's shared field CSS and the proposal JSON into
// proposals/page/<slug>.html, so the page renders the real system. The hub serves the same page at
// /proposals/<slug>/prototype.
// Usage: node proposals/build-page.mjs <slug> [outFile]
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPrototype } from '@stillxp/specs/proposals';

const dir = dirname(fileURLToPath(import.meta.url));
const slug = process.argv[2];
if (!slug) { console.error('usage: node proposals/build-page.mjs <slug> [outFile]'); process.exit(1); }
const out = process.argv[3] ?? join(dir, 'dist', `${slug}.html`);

const html = renderPrototype({ repoRoot: join(dir, '..'), proposalsDir: dir }, slug);
if (!html) { console.error(`no proposals/${slug}.json with a proposals/page/${slug}.html template`); process.exit(1); }
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
