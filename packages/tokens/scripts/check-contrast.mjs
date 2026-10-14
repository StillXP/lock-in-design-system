// Verifies every pair in src/contrast-pairs.json meets its WCAG minimum,
// in light and dark mode, for the default theme and every project theme.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC_DIR, MODES, loadTokens, listThemes, resolveToken, contrastRatio } from '../lib/resolve.mjs';

export function checkContrast(srcDir = SRC_DIR) {
  const { pairs } = JSON.parse(readFileSync(join(srcDir, 'contrast-pairs.json'), 'utf8'));
  const results = [];
  for (const theme of [null, ...listThemes(srcDir)]) {
    const tokens = loadTokens({ srcDir, theme });
    for (const mode of MODES) {
      for (const { fg, bg, min } of pairs) {
        for (const b of bg) {
          const f = resolveToken(tokens, fg, mode).value;
          const bv = resolveToken(tokens, b, mode).value;
          if (!f.startsWith('#') || !bv.startsWith('#')) continue;
          const ratio = contrastRatio(f, bv);
          results.push({ theme: theme?.name ?? 'default', mode, fg, bg: b, ratio: Math.round(ratio * 100) / 100, min, pass: ratio >= min });
        }
      }
    }
  }
  return results;
}

if (process.argv[1]?.endsWith('check-contrast.mjs')) {
  const results = checkContrast();
  const failures = results.filter((r) => !r.pass);
  for (const f of failures) {
    console.error(`✗ [${f.theme}/${f.mode}] ${f.fg} on ${f.bg}: ${f.ratio}:1 (needs ${f.min}:1)`);
  }
  console.log(`${results.length - failures.length}/${results.length} contrast checks passed.`);
  process.exit(failures.length ? 1 : 0);
}
