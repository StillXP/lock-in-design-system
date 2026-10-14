// Typed access to the design system's own data: built tokens and component specs.
import flat from '@lockin/tokens/json/tokens.flat';

export type ModeValue<T> = { light: T; dark: T };
export interface FlatToken {
  name: string;
  cssVar: string;
  type: string;
  layer: 'base' | 'semantic';
  description?: string;
  value: unknown;
  aliasOf?: string | ModeValue<string>;
}

export const allTokens = flat as FlatToken[];

/** Tokens whose name starts with `prefix.` (or equals it). */
export function tokensUnder(prefix: string): FlatToken[] {
  return allTokens.filter((t) => t.name === prefix || t.name.startsWith(`${prefix}.`));
}

export function token(name: string): FlatToken {
  const t = allTokens.find((x) => x.name === name);
  if (!t) throw new Error(`Unknown token ${name}`);
  return t;
}

export function isModeValue(v: unknown): v is ModeValue<string> {
  return typeof v === 'object' && v !== null && 'light' in v && 'dark' in v;
}

// --- WCAG relative luminance / contrast (same formula as @lockin/tokens check-contrast) ---
function channel(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
function luminance(hex: string) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// --- Component specs (packages/specs/components/*.json) ---
export interface ComponentSpec {
  name: string;
  slug: string;
  import: { web: string; native: string };
  status: string;
  version: string;
  category: string;
  purpose: string;
  props: Array<{ name: string; type: string; default?: unknown; required: boolean; description: string; platforms?: string[] }>;
  states: Array<{ name: string; description: string }>;
  tokens: Array<{ token: string; usage: string }>;
  accessibility: {
    role: string;
    keyboard?: Array<{ keys: string; action: string }>;
    screenReader?: string[];
    focus?: string;
    touchTarget?: string;
    wcag?: string[];
    notes?: string[];
  };
  variants: Array<{ name: string; description: string; useWhen?: string }>;
  usage: {
    do: string[];
    dont: string[];
    related: Array<{ name: string; reason: string }>;
    example: { web?: string; native?: string };
  };
}

const specFiles = import.meta.glob<ComponentSpec>('../../../../packages/specs/components/*.json', {
  eager: true,
  import: 'default',
});
export const specs: Record<string, ComponentSpec> = Object.fromEntries(
  Object.values(specFiles).map((s) => [s.slug, s]),
);

/**
 * Meta helper: component description and the spec slug used by <SpecDetails>.
 * Titles stay literal in each stories file because Storybook indexes them statically.
 */
export function specMeta(slug: string) {
  const spec = specs[slug];
  if (!spec) throw new Error(`No spec for ${slug}`);
  return {
    parameters: {
      lockin: { spec: slug },
      docs: { description: { component: spec.purpose } },
    },
  };
}
