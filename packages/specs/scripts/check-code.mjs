// Checks that every component spec still describes the real React and React Native components.
// Reads each component's props type with the TypeScript compiler API and compares it with the spec:
//   - every prop the component declares itself is in the spec (passthrough HTML / RN props are not)
//   - every spec prop exists on the component for the platforms it lists
//   - required vs optional, string-literal values and literal defaults match
// Run with: npm run check:code -w @lockin/specs
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { loadSpecs } from './validate.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

/** Props every component may take as an escape hatch without listing them in the spec (see docs/components.md). */
const UNLISTED = new Set(['className', 'style', 'ref', 'key']);
/** Names that exist on one platform only, so a combined spec name like "aria-label / accessibilityLabel" can be checked per platform. */
const PLATFORM_NAME = { 'aria-label': 'web', accessibilityLabel: 'native' };

const PLATFORMS = {
  web: { dir: 'packages/react', file: (name) => (name === 'RadioGroup' ? 'Radio/Radio.tsx' : `${name}/${name}.tsx`), base: 'src/components' },
  native: { dir: 'packages/react-native', file: (name) => `${name}.tsx`, base: 'src/components' },
};

function createProgram(pkgDir) {
  const configPath = join(repo, pkgDir, 'tsconfig.json');
  const raw = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(raw.config, ts.sys, join(repo, pkgDir));
  return ts.createProgram(parsed.fileNames, { ...parsed.options, noEmit: true });
}

const isOwn = (symbol) => symbol.declarations?.some((d) => !d.getSourceFile().fileName.includes('/node_modules/')) ?? false;
const isOptional = (symbol) => Boolean(symbol.flags & ts.SymbolFlags.Optional);

/** Values of a union made only of string literals, else null. */
function literalValues(checker, symbol, location) {
  const type = checker.getTypeOfSymbolAtLocation(symbol, location);
  const members = type.isUnion() ? type.types : [type];
  const real = members.filter((t) => !(t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)));
  return real.length && real.every((t) => t.isStringLiteral()) ? real.map((t) => t.value).sort() : null;
}

/** String-literal union from a spec type like "'sm' | 'md'", else null. */
function specLiterals(type) {
  return /^'[^']*'( \| '[^']*')*$/.test(type) ? [...type.matchAll(/'([^']*)'/g)].map((m) => m[1]).sort() : null;
}

function literalOf(node) {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(node.operand)) return -Number(node.operand.text);
  return undefined;
}

/** Literal defaults from the component function's destructured parameter, by prop name. */
function codeDefaults(sourceFile, componentName) {
  const defaults = new Map();
  const visit = (node) => {
    const named = (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) && node.name?.text === componentName;
    const param = named ? node.parameters[0] : undefined;
    if (param && ts.isObjectBindingPattern(param.name)) {
      for (const el of param.name.elements) {
        const key = el.propertyName ?? el.name;
        const name = ts.isIdentifier(key) || ts.isStringLiteral(key) ? key.text : undefined;
        if (name && el.initializer) defaults.set(name, literalOf(el.initializer));
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return defaults;
}

const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const fmt = (v) => (typeof v === 'string' ? `"${v}"` : String(v));

export function checkSpec(spec, programs) {
  const errors = [];
  const found = {};

  for (const [platform, cfg] of Object.entries(PLATFORMS)) {
    const appliesTo = (p) => !p.platforms || p.platforms.includes(platform);
    const program = programs[platform];
    const file = join(repo, cfg.dir, cfg.base, cfg.file(spec.name)).replace(/\\/g, '/');
    const sourceFile = program.getSourceFile(file);
    if (!sourceFile) { errors.push(`${platform}: component file not found (${file.replace(`${repo}/`, '')})`); continue; }
    const checker = program.getTypeChecker();
    const propsName = `${spec.name}Props`;
    const decl = sourceFile.statements.find((s) => (ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s)) && s.name.text === propsName);
    if (!decl) { errors.push(`${platform}: no exported ${propsName} in ${file.replace(`${repo}/`, '')}`); continue; }
    const type = checker.getDeclaredTypeOfSymbol(checker.getSymbolAtLocation(decl.name));
    const all = new Map(checker.getPropertiesOfType(type).map((s) => [s.getName(), s]));
    const defaults = codeDefaults(sourceFile, spec.name);
    found[platform] = { all };

    // spec names that apply on this platform
    const listed = new Set();
    for (const p of spec.props.filter(appliesTo)) {
      const parts = p.name.split(' / ');
      for (const part of parts) {
        if (PLATFORM_NAME[part] && PLATFORM_NAME[part] !== platform) continue;
        listed.add(part);
        const symbol = all.get(part);
        if (!symbol) { errors.push(`${platform}: spec lists "${part}" but ${propsName} has no such prop`); continue; }
        if (isOptional(symbol) === p.required) errors.push(`${platform}: "${part}" is ${isOptional(symbol) ? 'optional' : 'required'} in code but the spec says required: ${p.required}`);
        const want = specLiterals(p.type);
        const got = want && literalValues(checker, symbol, decl);
        if (want && got && !same(want, got)) errors.push(`${platform}: "${part}" values differ. Spec: ${want.join(', ')}. Code: ${got.join(', ')}`);
        if (defaults.has(part)) {
          const code = defaults.get(part);
          if (code !== undefined) {
            if (p.default === undefined) {
              // a combined name such as "value / defaultValue" can't carry one default for both parts
              if (parts.length === 1) errors.push(`${platform}: "${part}" defaults to ${fmt(code)} in code but the spec lists no default`);
            } else if (typeof p.default !== 'string' || !/[ (]/.test(p.default)) {
              if (String(p.default) !== String(code)) errors.push(`${platform}: "${part}" defaults to ${fmt(code)} in code but ${fmt(p.default)} in the spec`);
            }
          }
        }
      }
    }
    // props the component declares itself
    for (const [name, symbol] of all) {
      if (!isOwn(symbol) || UNLISTED.has(name) || listed.has(name)) continue;
      const elsewhere = spec.props.some((p) => p.name.split(' / ').includes(name));
      errors.push(`${platform}: code declares "${name}" but the spec ${elsewhere ? `only lists it for the other platform` : 'does not list it'}`);
    }
  }
  return errors;
}

export const createPrograms = () => Object.fromEntries(Object.entries(PLATFORMS).map(([k, v]) => [k, createProgram(v.dir)]));

if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/check-code.mjs')) {
  const programs = createPrograms();
  const specs = loadSpecs();
  let failed = 0;
  for (const { spec } of specs) {
    const errors = checkSpec(spec, programs);
    if (errors.length) {
      failed++;
      console.error(`✗ ${spec.name}\n  - ${errors.join('\n  - ')}`);
    }
  }
  if (failed) {
    console.error(`\n${failed}/${specs.length} specs drift from the code. Update the spec (and its figma.props) or the component so they match.`);
    process.exit(1);
  }
  console.log(`✓ ${specs.length} specs match the React and React Native components.`);
}
