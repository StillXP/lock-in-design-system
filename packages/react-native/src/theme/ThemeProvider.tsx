import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme, type TextStyle } from 'react-native';
import { nativeTokens, nativeThemes, type NativeTokenTree } from '@lockin/tokens/native';

export type ColorMode = 'light' | 'dark';

interface ThemeContextValue {
  /** Resolved tokens for the active mode and project theme. */
  t: NativeTokenTree;
  mode: ColorMode;
}

const ThemeContext = createContext<ThemeContextValue>({ t: nativeTokens.light, mode: 'light' });

export interface ThemeProviderProps {
  /** 'system' follows the OS appearance setting. */
  mode?: ColorMode | 'system';
  /** Project theme name from @lockin/tokens (e.g. 'arena'). Omit for the default theme. */
  theme?: string;
  children: ReactNode;
}

export function ThemeProvider({ mode = 'system', theme, children }: ThemeProviderProps) {
  const scheme = useColorScheme();
  const resolved: ColorMode = mode === 'system' ? (scheme === 'dark' ? 'dark' : 'light') : mode;
  const value = useMemo(() => {
    const source = theme && nativeThemes[theme] ? nativeThemes[theme] : nativeTokens;
    return { t: source[resolved], mode: resolved };
  }, [resolved, theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Access tokens: const { t } = useTheme(); t.color.text.primary */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

type Typography = { fontFamily?: string; fontSize: number; fontWeight: string; lineHeight: number; letterSpacing: number | string };

/** Convert a typography token into an RN TextStyle ('System' → platform default font). */
export function textStyle(typo: Typography): TextStyle {
  const { fontFamily, ...rest } = typo;
  return {
    ...(rest as TextStyle),
    letterSpacing: typeof rest.letterSpacing === 'number' ? rest.letterSpacing : 0,
    ...(fontFamily && fontFamily !== 'System' ? { fontFamily } : null),
  };
}

/** hitSlop that grows a control to the 44pt minimum touch target. */
export function touchSlop(t: NativeTokenTree, height: number, width = height) {
  const min = t.size.touchTarget.min;
  const v = Math.max(0, (min - height) / 2);
  const h = Math.max(0, (min - width) / 2);
  return { top: v, bottom: v, left: h, right: h };
}
