// Exports the tokens as a payload for Figma Variables:
//   dist/figma/variables.json   collections, modes and variables, ready to apply with the Figma plugin API
// The mapping rules (collections, names, modes, aliases) are documented in docs/figma-sync.md.
// Code is the source of truth; this file is one-way, code -> Figma.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PACKAGE_ROOT, MODES, loadTokens, listThemes, resolveToken, hexToRgb, cssVarName,
} from '../lib/resolve.mjs';

const REF = /^\{([^}]+)\}$/;
const slash = (path) => path.replace(/\./g, '/');
const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const code = (path) => ({ WEB: `var(${cssVarName(path)})` });

// Token groups by Figma collection. Everything else is reported under `skipped`.
const DIMENSION_GROUPS = ['space', 'size', 'radius', 'border', 'focus', 'breakpoint'];
const TYPOGRAPHY_GROUPS = ['font.family', 'font.size', 'font.weight', 'font.lineHeight', 'font.letterSpacing'];
const inGroup = (path, groups) => groups.some((g) => path.startsWith(`${g}.`));

// Figma scopes for the Typography collection, matching the live file.
const TYPOGRAPHY_SCOPES = {
  'font.family': ['FONT_FAMILY'], 'font.size': ['FONT_SIZE'], 'font.weight': ['FONT_WEIGHT'],
  'font.lineHeight': ['LINE_HEIGHT'], 'font.letterSpacing': ['LETTER_SPACING'],
};

const isColor = (t) => t.type === 'color';
const isBrand = (path) => path.startsWith('color.brand.');
const isBaseColor = (t) => isColor(t) && t.layer === 'base' && !isBrand(t.path);

// ---------- colors ----------

const rgba = (hex, a = 1) => {
  const [r, g, b] = hexToRgb(hex);
  return { r: +(r / 255).toFixed(4), g: +(g / 255).toFixed(4), b: +(b / 255).toFixed(4), a };
};

function parseColor(str) {
  if (str === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (str.startsWith('#')) return rgba(str);
  const m = str.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (!m) throw new Error(`Unsupported color value "${str}"`);
  return { r: +(m[1] / 255).toFixed(4), g: +(m[2] / 255).toFixed(4), b: +(m[3] / 255).toFixed(4), a: m[4] === undefined ? 1 : +m[4] };
}

/** Where a color reference points in Figma. Brand aliases collapse to the hue the theme maps them to. */
function colorAlias(tokens, ref, themed = true) {
  if (isBrand(ref) && themed) {
    const target = tokens.get(ref).value.match(REF)[1];
    return { alias: `Primitives/${slash(target.slice('color.'.length))}` };
  }
  const t = tokens.get(ref);
  const collection = t.layer === 'base' ? 'Primitives' : 'Color';
  return { alias: `${collection}/${slash(ref.slice('color.'.length))}` };
}

function colorValue(tokens, path, mode, themed) {
  const token = tokens.get(path);
  const raw = typeof token.value === 'object' && ('light' in token.value || 'dark' in token.value)
    ? token.value[mode] ?? token.value.light
    : token.value;
  // Alpha is baked into the color, so it can't stay an alias.
  if (token.extensions?.['ds.alpha'] !== undefined) return parseColor(resolveToken(tokens, path, mode).value);
  const m = typeof raw === 'string' && raw.match(REF);
  return m ? colorAlias(tokens, m[1], themed) : parseColor(raw);
}

function buildPrimitives(tokens) {
  const variables = [];
  for (const [path, t] of tokens) {
    if (isBaseColor(t)) {
      variables.push({
        name: slash(path.slice('color.'.length)),
        type: 'COLOR',
        values: { Value: parseColor(t.value) },
        codeSyntax: code(path),
      });
    }
  }
  // brand/N aliases a hue (blue by default); themed modes in Color skip it and point at their own hue.
  for (const [path, t] of tokens) {
    if (isBrand(path)) {
      variables.push({
        name: slash(path.slice('color.'.length)),
        type: 'COLOR',
        values: { Value: colorAlias(tokens, path) },
        codeSyntax: code(path),
      });
    }
  }
  return { name: 'Primitives', hiddenFromPublishing: true, scopes: [], modes: ['Value'], variables };
}

function buildColor(themes) {
  const modes = [];
  const byMode = [];
  for (const theme of [null, ...themes]) {
    const tokens = loadTokens({ theme: theme?.name });
    for (const mode of MODES) {
      modes.push(`${theme ? `${titleCase(theme.name)} ` : ''}${titleCase(mode)}`);
      byMode.push({ tokens, mode, themed: Boolean(theme) });
    }
  }
  const base = byMode[0].tokens;
  const variables = [];
  for (const [path, t] of base) {
    if (!isColor(t) || t.layer !== 'semantic') continue;
    const values = {};
    byMode.forEach(({ tokens, mode, themed }, i) => { values[modes[i]] = colorValue(tokens, path, mode, themed); });
    variables.push({
      name: slash(path.slice('color.'.length)),
      type: 'COLOR',
      ...(t.description ? { description: t.description } : {}),
      values,
      codeSyntax: code(path),
    });
  }
  return { name: 'Color', modes, variables };
}

// ---------- numbers and strings ----------

/** Dimensions come out as plain numbers (px). Line height (a multiplier) and letter spacing (em) are percentages in Figma. */
function numeric(path, value) {
  if (path.startsWith('font.lineHeight.')) return { value: +(value * 100).toFixed(4), unit: 'percent' };
  if (typeof value === 'number') return { value, unit: 'number' };
  if (path.startsWith('font.letterSpacing.')) {
    if (!value.endsWith('em')) throw new Error(`${path}: expected em, got ${value}`);
    return { value: +(parseFloat(value) * 100).toFixed(4), unit: 'percent' };
  }
  if (!value.endsWith('px')) throw new Error(`${path}: expected px, got ${value}`);
  return { value: parseFloat(value), unit: 'px' };
}

function buildSingleMode(tokens, name, groups) {
  const own = new Set([...tokens.keys()].filter((p) => inGroup(p, groups)));
  const variables = [];
  for (const path of own) {
    const t = tokens.get(path);
    const ref = typeof t.value === 'string' && t.value.match(REF);
    const resolved = resolveToken(tokens, path, 'light').value;
    const variable = {
      name: slash(path),
      ...(t.description ? { description: t.description } : {}),
      codeSyntax: code(path),
      ...(name === 'Typography' ? { scopes: TYPOGRAPHY_SCOPES[path.split('.').slice(0, 2).join('.')] } : {}),
    };
    if (t.type === 'fontFamily') {
      // Figma needs a single family name. The full stack stays in code.
      variables.push({ ...variable, type: 'STRING', values: { Value: resolved[0] } });
    } else if (ref && own.has(ref[1])) {
      variables.push({ ...variable, type: 'FLOAT', ...(t.type === 'dimension' ? { unit: numeric(path, resolved).unit } : {}), values: { Value: { alias: `${name}/${slash(ref[1])}` } } });
    } else {
      const n = numeric(path, resolved);
      variables.push({ ...variable, type: 'FLOAT', unit: n.unit, values: { Value: n.value } });
    }
  }
  return { name, modes: ['Value'], variables };
}

// ---------- build ----------

const themes = listThemes();
const base = loadTokens();

const collections = [
  buildPrimitives(base),
  buildColor(themes),
  buildSingleMode(base, 'Dimensions', DIMENSION_GROUPS),
  buildSingleMode(base, 'Typography', TYPOGRAPHY_GROUPS),
];

const covered = (p) => p.startsWith('color.') || inGroup(p, DIMENSION_GROUPS) || inGroup(p, TYPOGRAPHY_GROUPS);
const skipped = {};
for (const [path, t] of base) {
  if (covered(path)) continue;
  (skipped[t.type] ??= []).push(path);
}

const payload = {
  $comment: 'Generated by @lockin/tokens (npm run figma). Do not edit. Mapping rules: docs/figma-sync.md.',
  collections,
  skipped,
};

const outDir = join(PACKAGE_ROOT, 'dist', 'figma');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'variables.json'), `${JSON.stringify(payload, null, 2)}\n`);

for (const c of collections) {
  console.log(`${c.name.padEnd(11)} ${String(c.variables.length).padStart(3)} variables, modes: ${c.modes.join(', ')}`);
}
console.log(`Skipped (not variables): ${Object.entries(skipped).map(([t, p]) => `${t} ${p.length}`).join(', ')}`);
console.log('Wrote dist/figma/variables.json');
