import { useOf } from '@storybook/addon-docs/blocks';
import { specs } from './data';

/**
 * Renders the AI-readable spec for the component on this docs page, so humans read
 * exactly what agents get from `get_component`. Set `parameters.lockin.spec` (via specMeta).
 */
export function SpecDetails() {
  const resolved = useOf('meta');
  const slug = resolved.type === 'meta' ? (resolved.preparedMeta.parameters?.lockin?.spec as string | undefined) : undefined;
  const spec = slug ? specs[slug] : undefined;
  if (!spec) return null;
  const a = spec.accessibility;

  return (
    <section className="spec-details">
      <h2 id="spec">Spec</h2>
      <p className="spec-meta">
        <span className="spec-pill">{spec.status}</span>
        <span className="spec-pill">v{spec.version}</span>
        <span className="spec-pill">{spec.category}</span>
        <span>
          Source: <code>packages/specs/components/{spec.slug}.json</code> · MCP: <code>get_component("{spec.name}")</code>
        </span>
      </p>
      <pre>
        <code>{`${spec.import.web}\n${spec.import.native}`}</code>
      </pre>

      <h3>Variants</h3>
      <table>
        <thead>
          <tr><th>Variant</th><th>Description</th><th>Use when</th></tr>
        </thead>
        <tbody>
          {spec.variants.map((v) => (
            <tr key={v.name}><td><code>{v.name}</code></td><td>{v.description}</td><td>{v.useWhen}</td></tr>
          ))}
        </tbody>
      </table>

      <h3>States</h3>
      <table>
        <tbody>
          {spec.states.map((s) => (
            <tr key={s.name}><td><code>{s.name}</code></td><td>{s.description}</td></tr>
          ))}
        </tbody>
      </table>

      <h3>Usage</h3>
      <div className="spec-dodont">
        <div className="spec-do">
          <h4>Do</h4>
          <ul>{spec.usage.do.map((d) => <li key={d}>{d}</li>)}</ul>
        </div>
        <div className="spec-dont">
          <h4>Don't</h4>
          <ul>{spec.usage.dont.map((d) => <li key={d}>{d}</li>)}</ul>
        </div>
      </div>
      {spec.usage.related.length > 0 && (
        <>
          <h4>Related</h4>
          <ul>{spec.usage.related.map((r) => <li key={r.name}><strong>{r.name}</strong> — {r.reason}</li>)}</ul>
        </>
      )}
      {spec.usage.example.native && (
        <>
          <h4>React Native</h4>
          <pre><code>{spec.usage.example.native}</code></pre>
        </>
      )}

      <h3>Accessibility</h3>
      <p><strong>Role:</strong> {a.role}</p>
      {a.keyboard && a.keyboard.length > 0 && (
        <table>
          <thead><tr><th>Keys</th><th>Action</th></tr></thead>
          <tbody>{a.keyboard.map((k) => <tr key={k.keys}><td><kbd>{k.keys}</kbd></td><td>{k.action}</td></tr>)}</tbody>
        </table>
      )}
      {a.screenReader && (
        <>
          <h4>Screen readers</h4>
          <ul>{a.screenReader.map((s) => <li key={s}>{s}</li>)}</ul>
        </>
      )}
      {a.focus && <p><strong>Focus:</strong> {a.focus}</p>}
      {a.touchTarget && <p><strong>Touch target:</strong> {a.touchTarget}</p>}
      {a.wcag && <p><strong>WCAG:</strong> {a.wcag.join(' · ')}</p>}
      {a.notes && <ul>{a.notes.map((n) => <li key={n}>{n}</li>)}</ul>}

      <h3>Tokens</h3>
      <table>
        <thead><tr><th>Token</th><th>Usage</th></tr></thead>
        <tbody>
          {spec.tokens.map((t) => (
            <tr key={t.token}><td><code>{t.token}</code></td><td>{t.usage}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
