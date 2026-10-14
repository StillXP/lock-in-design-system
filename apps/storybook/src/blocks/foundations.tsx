// Small presentational pieces shared by the Foundations stories.
import type { ReactNode } from 'react';
import { contrast, isModeValue, type FlatToken } from './data';

export function Section({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section className="fd-section">
      <h2>{title}</h2>
      {intro && <p>{intro}</p>}
      {children}
    </section>
  );
}

const modeValue = (t: FlatToken) => (isModeValue(t.value) ? t.value : { light: String(t.value), dark: String(t.value) });
const short = (name: string) => name.replace(/^color\./, '');

/**
 * A semantic color. The chip uses the live CSS variable, so the Mode and Theme toolbars apply;
 * the caption lists the light/dark values and their base aliases.
 * `on` renders an "Aa" text sample on that background and adds the WCAG contrast ratio per mode.
 */
export function ColorSwatch({ token, on }: { token: FlatToken; on?: FlatToken }) {
  const v = modeValue(token);
  const alias = token.aliasOf && isModeValue(token.aliasOf) ? token.aliasOf : undefined;
  const ratio =
    on && (['light', 'dark'] as const).map((m) => `${m} ${contrast(v[m], modeValue(on)[m]).toFixed(2)}:1`).join(' · ');
  return (
    <div className="fd-swatch">
      <span
        className="fd-swatch__chip"
        style={on ? { color: `var(${token.cssVar})`, background: `var(${on.cssVar})` } : { background: `var(${token.cssVar})` }}
        aria-hidden="true"
      >
        {on ? 'Aa' : null}
      </span>
      <span className="fd-swatch__body">
        <span className="fd-swatch__name">{short(token.name)}</span>
        <span className="fd-swatch__meta fd-mono">{token.cssVar}</span>
        <span className="fd-swatch__meta">
          Light {v.light}
          {alias && ` (${short(alias.light)})`} · Dark {v.dark}
          {alias && ` (${short(alias.dark)})`}
        </span>
        {ratio && (
          <span className="fd-swatch__meta">
            On {short(on!.name)}: {ratio}
          </span>
        )}
        {token.description && <span className="fd-swatch__meta">{token.description}</span>}
      </span>
    </div>
  );
}

export function TokenTable({ tokens, preview }: { tokens: FlatToken[]; preview?: (t: FlatToken) => ReactNode }) {
  return (
    <table className="fd-table">
      <thead>
        <tr>
          <th scope="col">Token</th>
          <th scope="col">CSS variable</th>
          <th scope="col">Value</th>
          {preview && <th scope="col">Preview</th>}
        </tr>
      </thead>
      <tbody>
        {tokens.map((t) => (
          <tr key={t.name}>
            <th scope="row">{t.name}</th>
            <td className="fd-mono">{t.cssVar}</td>
            <td className="fd-mono">{typeof t.value === 'object' ? JSON.stringify(t.value) : String(t.value)}</td>
            {preview && <td>{preview(t)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
