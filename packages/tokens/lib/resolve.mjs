// Token engine: loads DTCG (Format Module 2025.10) JSON sources, validates their values, applies a theme, and resolves
// references per color mode. Zero dependencies so the build, the contrast
// checker and the server can all share it.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SRC_DIR = join(PACKAGE_ROOT, 'src');
export const MODES = ['light', 'dark'];
export const CSS_PREFIX = 'ds';

const HUES = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'neutral'];
const REF = /^\{([^}]+)\}$/;

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const jsonFiles = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => join(dir, f)) : [];

export const isModeValue = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v) && ('light' in v || 'dark' in v) &&
  Object.keys(v).every((k) => MODES.includes(k));

// ---------- DTCG 2025.10 values ----------
// Sources follow the Format Module 2025.10 (https://www.designtokens.org/tr/2025.10/format/):
// colors are { colorSpace, components, alpha?, hex? }, dimensions and durations are { value, unit }.
// The engine turns them into CSS-ready strings ("#DC2626", "rgba(…)", "16px", "120ms") so every
// output (CSS, JS, native, JSON, Figma) keeps working on plain strings.

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isRef = (v) => typeof v === 'string' && REF.test(v);
const isColorObject = (v) => isPlainObject(v) && 'colorSpace' in v;
const isUnitObject = (v) =>
  isPlainObject(v) && Object.keys(v).length === 2 && typeof v.value === 'number' && typeof v.unit === 'string';

const DIMENSION_UNITS = ['px', 'rem'];
// `em` is not a DTCG dimension unit. Letter spacing and underline offset still need it until
// they move to a spec type (see TODO.md); nothing else may use it.
const EM_PATHS = ['font.letterSpacing.', 'font.underlineOffset.'];
const SHADOW_DIMENSIONS = ['offsetX', 'offsetY', 'blur', 'spread'];

const hexFromComponents = (components) =>
  `#${components.map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;

function colorErrors(v) {
  if (isRef(v)) return [];
  if (!isColorObject(v)) return [`color must be a reference or { colorSpace, components, alpha?, hex? }, got ${JSON.stringify(v)}`];
  const errors = [];
  if (v.colorSpace !== 'srgb') errors.push(`colorSpace "${v.colorSpace}" is not supported (use "srgb")`);
  if (!Array.isArray(v.components) || v.components.length !== 3 || !v.components.every((c) => typeof c === 'number' && c >= 0 && c <= 1)) {
    errors.push('components must be three numbers between 0 and 1');
  }
  if (v.alpha !== undefined && !(typeof v.alpha === 'number' && v.alpha >= 0 && v.alpha <= 1)) errors.push('alpha must be a number between 0 and 1');
  if (v.hex !== undefined) {
    if (!/^#[0-9a-f]{6}$/i.test(v.hex)) errors.push(`hex "${v.hex}" must be #RRGGBB`);
    else if (!errors.length && hexFromComponents(v.components) !== v.hex.toUpperCase()) {
      errors.push(`hex ${v.hex} does not match components (${hexFromComponents(v.components)})`);
    }
  }
  const extra = Object.keys(v).filter((k) => !['colorSpace', 'components', 'alpha', 'hex'].includes(k));
  if (extra.length) errors.push(`unknown color properties: ${extra.join(', ')}`);
  return errors;
}

function unitErrors(v, units, kind) {
  if (isRef(v)) return [];
  if (!isUnitObject(v)) return [`${kind} must be a reference or { value, unit }, got ${JSON.stringify(v)}`];
  return units.includes(v.unit) ? [] : [`${kind} unit "${v.unit}" must be one of ${units.join(', ')}`];
}

/** Errors for one raw $value against its DTCG type. Types without a check here pass. */
export function valueErrors(type, value, path = '') {
  if (isModeValue(value)) return Object.values(value).flatMap((v) => valueErrors(type, v, path));
  switch (type) {
    case 'color':
      return colorErrors(value);
    case 'dimension':
      return unitErrors(value, EM_PATHS.some((p) => path.startsWith(p)) ? [...DIMENSION_UNITS, 'em'] : DIMENSION_UNITS, 'dimension');
    case 'duration':
      return unitErrors(value, ['ms', 's'], 'duration');
    case 'shadow': {
      if (isRef(value)) return [];
      if (!isPlainObject(value)) return [`shadow must be an object, got ${JSON.stringify(value)}`];
      const extra = Object.keys(value).filter((k) => ![...SHADOW_DIMENSIONS, 'color', 'inset'].includes(k));
      return [
        ...SHADOW_DIMENSIONS.flatMap((k) => (k in value ? unitErrors(value[k], DIMENSION_UNITS, `shadow ${k}`) : [`shadow is missing ${k}`])),
        ...colorErrors(value.color),
        ...(value.inset !== undefined && typeof value.inset !== 'boolean' ? ['shadow inset must be a boolean'] : []),
        ...(extra.length ? [`unknown shadow properties: ${extra.join(', ')}`] : []),
      ];
    }
    default:
      return [];
  }
}

function colorToCss(v) {
  const alpha = v.alpha ?? 1;
  if (alpha === 0) return 'transparent';
  const [r, g, b] = v.components.map((c) => Math.round(c * 255));
  return alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : (v.hex?.toUpperCase() ?? hexFromComponents(v.components));
}

/** Turn DTCG value objects (anywhere inside a $value) into CSS-ready strings. References are kept. */
export function toCssValue(v) {
  if (isColorObject(v)) return colorToCss(v);
  if (isUnitObject(v)) return `${v.value}${v.unit}`;
  if (isPlainObject(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toCssValue(x)]));
  return v;
}

/** Validate a raw $value and return its CSS-ready form. Throws with the token path on invalid values. */
function prepareValue(type, raw, path, where) {
  const errors = valueErrors(type, raw, path);
  if (errors.length) throw new Error(`${where}${path}: ${errors.join('; ')}`);
  return toCssValue(raw);
}

/** Flatten a DTCG tree into Map<path, token>, inheriting $type from groups. */
export function flatten(tree, { file, layer } = {}, prefix = [], inherited = {}, out = new Map()) {
  const type = tree.$type ?? inherited.type;
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith('$') || node === null || typeof node !== 'object') continue;
    const path = [...prefix, key];
    if ('$value' in node) {
      const tokenType = node.$type ?? type;
      out.set(path.join('.'), {
        path: path.join('.'),
        type: tokenType,
        // CSS-ready value the engine resolves; `source` keeps the DTCG $value as written.
        value: prepareValue(tokenType, node.$value, path.join('.'), file ? `${file}: ` : ''),
        source: node.$value,
        description: node.$description,
        extensions: node.$extensions,
        file,
        layer,
      });
    } else {
      flatten(node, { file, layer }, path, { type }, out);
    }
  }
  return out;
}

/** Load raw (unresolved) tokens from src/, optionally applying a theme. */
export function loadTokens({ srcDir = SRC_DIR, theme } = {}) {
  const tokens = new Map();
  for (const layer of ['base', 'semantic']) {
    for (const file of jsonFiles(join(srcDir, layer))) {
      flatten(readJson(file), { file, layer }, [], {}, tokens);
    }
  }
  const themeConfig = typeof theme === 'string' ? loadTheme(theme, srcDir) : theme;
  if (themeConfig) applyTheme(tokens, themeConfig);
  return tokens;
}

export function listThemes(srcDir = SRC_DIR) {
  return jsonFiles(join(srcDir, 'themes')).map(readJson);
}

export function loadTheme(name, srcDir = SRC_DIR) {
  if (!/^[a-z0-9-]+$/i.test(name)) throw new Error(`Unknown theme "${name}"`);
  const file = join(srcDir, 'themes', `${name}.json`);
  if (!existsSync(file)) throw new Error(`Unknown theme "${name}"`);
  return readJson(file);
}

function applyTheme(tokens, theme) {
  if (theme.brand) {
    if (!HUES.includes(theme.brand)) throw new Error(`Theme brand must be one of ${HUES.join(', ')}`);
    for (const [path, token] of tokens) {
      if (path.startsWith('color.brand.')) {
        tokens.set(path, { ...token, value: `{color.${theme.brand}.${path.split('.').pop()}}` });
      }
    }
  }
  for (const [path, value] of Object.entries(theme.overrides ?? {})) {
    const token = tokens.get(path);
    if (!token) throw new Error(`Theme "${theme.name}" overrides unknown token ${path}`);
    tokens.set(path, { ...token, value: prepareValue(token.type, value, path, `Theme "${theme.name}": `), source: value });
  }
}

/** Resolve one token for a mode. Returns { value, refs } where refs is the alias chain. */
export function resolveToken(tokens, path, mode = 'light', seen = []) {
  if (seen.includes(path)) throw new Error(`Circular reference: ${[...seen, path].join(' -> ')}`);
  const token = tokens.get(path);
  if (!token) throw new Error(`Unknown token reference {${path}}${seen.length ? ` (from ${seen.at(-1)})` : ''}`);
  const raw = isModeValue(token.value) ? token.value[mode] ?? token.value.light : token.value;
  return resolveValue(tokens, raw, mode, [...seen, path]);
}

function resolveValue(tokens, raw, mode, seen) {
  if (typeof raw === 'string') {
    const m = raw.match(REF);
    if (m) {
      const inner = resolveToken(tokens, m[1], mode, seen);
      return { value: inner.value, refs: [m[1], ...inner.refs] };
    }
    return { value: raw, refs: [] };
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const value = {};
    for (const [k, v] of Object.entries(raw)) value[k] = resolveValue(tokens, v, mode, seen).value;
    return { value, refs: [] };
  }
  return { value: raw, refs: [] };
}

/** Resolve all tokens: Map<path, { token, light, dark, refs: {light, dark} }> */
export function resolveAll(tokens) {
  const out = new Map();
  for (const [path, token] of tokens) {
    const entry = { token, values: {}, refs: {} };
    for (const mode of MODES) {
      const r = resolveToken(tokens, path, mode);
      entry.values[mode] = r.value;
      entry.refs[mode] = r.refs[0];
    }
    out.set(path, entry);
  }
  return out;
}

/**
 * CSS custom property for a token path: dots become dashes and camelCase becomes kebab-case,
 * so `color.text.linkHover` is `--ds-color-text-link-hover`. Token names keep their camelCase
 * everywhere else (JS, JSON, REST, MCP).
 */
export const cssVarName = (path) =>
  `--${CSS_PREFIX}-${path.replace(/\./g, '-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;

/** Nest a flat Map<path, value> into an object tree. */
export function nest(entries) {
  const root = {};
  for (const [path, value] of entries) {
    const parts = path.split('.');
    let node = root;
    for (const p of parts.slice(0, -1)) node = node[p] ??= {};
    node[parts.at(-1)] = value;
  }
  return root;
}

// ---------- color math ----------

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h.slice(0, 6);
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function withAlpha(color, alpha) {
  if (!color.startsWith('#') || alpha === undefined) return color;
  const [r, g, b] = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
