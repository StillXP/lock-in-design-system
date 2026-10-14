export type Mode = 'light' | 'dark';

export interface RawToken {
  path: string;
  type?: string;
  value: unknown;
  description?: string;
  extensions?: Record<string, unknown>;
  file?: string;
  layer?: 'base' | 'semantic';
}

export interface ThemeConfig {
  name: string;
  description?: string;
  brand?: string;
  overrides?: Record<string, unknown>;
}

export interface ResolvedEntry {
  token: RawToken;
  values: Record<Mode, unknown>;
  refs: Record<Mode, string | undefined>;
}

export declare const PACKAGE_ROOT: string;
export declare const SRC_DIR: string;
export declare const MODES: Mode[];
export declare const CSS_PREFIX: string;
export declare function isModeValue(v: unknown): boolean;
export declare function loadTokens(opts?: { srcDir?: string; theme?: string | ThemeConfig | null }): Map<string, RawToken>;
export declare function listThemes(srcDir?: string): ThemeConfig[];
export declare function loadTheme(name: string, srcDir?: string): ThemeConfig;
export declare function resolveToken(tokens: Map<string, RawToken>, path: string, mode?: Mode): { value: unknown; refs: string[] };
export declare function resolveAll(tokens: Map<string, RawToken>): Map<string, ResolvedEntry>;
export declare function cssVarName(path: string): string;
export declare function nest(entries: Iterable<[string, unknown]>): Record<string, unknown>;
export declare function hexToRgb(hex: string): [number, number, number];
export declare function withAlpha(color: string, alpha: number): string;
export declare function luminance(hex: string): number;
export declare function contrastRatio(a: string, b: string): number;
