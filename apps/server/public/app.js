// Lock In hub UI — dependency-free, uses the design system's own CSS.
// Every dynamic value goes through esc(); colors are applied via the CSSOM (CSP forbids inline styles).

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const main = $('#main');

const state = {
  key: localStorage.getItem('ds-api-key') ?? '',
  me: null,
  theme: localStorage.getItem('ds-theme') ?? '',
};

// ---------- color mode & theme ----------

function applyMode(mode) {
  if (mode === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('ds-color-mode', mode);
}
function applyTheme(name) {
  state.theme = name;
  localStorage.setItem('ds-theme', name);
  $('#tokens-css').href = name ? `/assets/tokens/themes/${encodeURIComponent(name)}.css` : '/assets/tokens/tokens.css';
}
const savedMode = localStorage.getItem('ds-color-mode') ?? 'system';
applyMode(savedMode);
applyTheme(state.theme);

// ---------- API ----------

class AuthError extends Error {}

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'content-type': 'application/json', 'x-ds-client': 'web', ...(state.key ? { authorization: `Bearer ${state.key}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) throw new AuthError('Unauthorized');
  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) throw Object.assign(new Error(data?.error ?? res.statusText), { data, status: res.status });
  return data;
}

const announce = (msg) => {
  const el = $('#announcer');
  el.textContent = '';
  setTimeout(() => (el.textContent = msg), 50);
};

const isAnonymous = () => !state.me || state.me.id === 'anonymous';
const can = (role) => {
  const rank = { viewer: 1, editor: 2, admin: 3 };
  return state.me && rank[state.me.role] >= rank[role];
};

// ---------- UI helpers (Lock In CSS classes) ----------

const TONE = { stable: 'success', beta: 'info', experimental: 'warning', deprecated: 'danger' };
const tag = (text, tone = 'neutral') =>
  `<span class="ds-tag ds-tag--${esc(tone)} ds-tag--subtle ds-tag--sm"><span class="ds-tag__label">${esc(text)}</span></span>`;
const btn = (label, { variant = 'primary', type = 'button', size = 'md', attrs = '' } = {}) =>
  `<button type="${type}" class="ds-button ds-focus-ring ds-button--${variant} ds-button--${size}" ${attrs}><span class="ds-button__label">${esc(label)}</span></button>`;
const code = (text) => `<pre tabindex="0"><code>${esc(text)}</code></pre>`;
const notice = (text, tone = 'info') => `<div class="notice ${tone === 'info' ? '' : `notice--${tone}`}" role="${tone === 'danger' ? 'alert' : 'status'}">${esc(text)}</div>`;

function table(caption, headers, rows, { rowHeader = true } = {}) {
  const id = `t${Math.random().toString(36).slice(2, 8)}`;
  return `<div class="ds-table-wrap"><div class="ds-table-scroll ds-focus-ring" role="region" aria-labelledby="${id}" tabindex="0">
    <table class="ds-table ds-table--compact"><caption id="${id}" class="ds-table__caption ds-visually-hidden">${esc(caption)}</caption>
    <thead><tr>${headers.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${rows.length ? rows.map((r) => `<tr>${r.map((c, i) => (i === 0 && rowHeader ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('') : `<tr><td colspan="${headers.length}" class="ds-table__status">Nothing here yet.</td></tr>`}</tbody>
    </table></div></div>`;
}

function field(label, control, { hint, id } = {}) {
  return `<div class="ds-field"><label class="ds-field__label" for="${id}">${esc(label)}</label>${hint ? `<p class="ds-field__hint" id="${id}-hint">${esc(hint)}</p>` : ''}${control}</div>`;
}
const select = (id, options, value = '') =>
  `<div class="ds-control ds-select ds-control--md"><select id="${id}" name="${id}" class="ds-control__input ds-select__input">${options
    .map(([v, l]) => `<option value="${esc(v)}" ${v === value ? 'selected' : ''}>${esc(l)}</option>`)
    .join('')}</select></div>`;
const input = (id, { type = 'text', value = '', required = false, placeholder = '' } = {}) =>
  `<div class="ds-control ds-control--md"><input id="${id}" name="${id}" type="${type}" class="ds-control__input" value="${esc(value)}" placeholder="${esc(placeholder)}" ${required ? 'required aria-required="true"' : ''} /></div>`;

const fmt = (v) => {
  if (v && typeof v === 'object' && !Array.isArray(v) && 'light' in v) return `light ${fmt(v.light)} · dark ${fmt(v.dark)}`;
  if (Array.isArray(v)) return v.join(', ');
  if (v && typeof v === 'object') return Object.entries(v).map(([k, x]) => `${k}: ${fmt(x)}`).join('; ');
  return String(v);
};
const modeVal = (v, mode) => (v && typeof v === 'object' && 'light' in v ? v[mode] : v);
const date = (iso) => new Date(iso).toLocaleString();

function render(title, html) {
  main.innerHTML = html;
  document.title = `${title} · Lock In`;
  // Apply dynamic colors/sizes through the CSSOM (CSP-safe).
  $$('[data-bg]', main).forEach((el) => (el.style.background = el.dataset.bg));
  $$('[data-w]', main).forEach((el) => (el.style.width = el.dataset.w));
  $$('a[href]', main).forEach((a) => {
    const m = a.getAttribute('href').match(/^\.?\/?([a-z0-9-]+)\.md(#.*)?$/);
    if (m) a.setAttribute('href', `#/docs/${m[1]}`);
  });
  main.focus();
}

// ---------- views ----------

const loginForm = () => `<form class="form" id="login-form">
      ${field('API key', input('api-key', { type: 'password', required: true }), { id: 'api-key', hint: 'The first admin key is printed in the server console on first start. Admins can create more under Settings.' })}
      <div>${btn('Sign in', { type: 'submit' })}</div>
    </form>`;

function bindLoginForm() {
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    state.key = $('#api-key').value.trim();
    localStorage.setItem('ds-api-key', state.key);
    await boot();
  });
}

function loginView(message) {
  render(
    'Sign in',
    `<h1>Sign in</h1>
    <p class="lead">Enter an API key to browse the design system.</p>
    ${message ? notice(message, 'danger') : ''}
    ${loginForm()}`,
  );
  bindLoginForm();
}

async function overview() {
  const o = await api('/overview');
  const stats = [
    ['Components', o.counts.components, '#/components'],
    ['Tokens', o.counts.tokens, '#/tokens'],
    ['Docs', o.counts.docs, '#/docs'],
    ['Icons', o.counts.icons, '#/components/icon'],
    ['Themes', o.counts.themes + 1, '#/tokens'],
    ['Unreleased changes', o.unreleasedChanges, '#/changes'],
  ];
  render(
    'Overview',
    `<h1>${esc(o.name)}</h1>
    <p class="lead">${esc(o.description)}</p>
    <p class="row">${tag(`v${o.version}`, 'brand')} ${tag(`Signed in as ${state.me.name} (${state.me.role})`)}</p>
    <h2>At a glance</h2>
    <div class="grid">${stats.map(([l, n, href]) => `<a class="card ds-focus-ring" href="${href}"><span class="stat">${esc(n)}</span><span>${esc(l)}</span></a>`).join('')}</div>
    <h2>For AI agents</h2>
    <p>Connect over MCP at <code>${esc(location.origin)}/mcp</code> with an API key, or read <a class="ds-link" href="/llms.txt">llms.txt</a>. Full guide: <a class="ds-link" href="#/docs/mcp-server">MCP server &amp; API</a>.</p>`,
  );
}

async function tokensView(params) {
  const { tokens } = await api(`/tokens${state.theme ? `?theme=${encodeURIComponent(state.theme)}` : ''}`);
  const q = (params.get('q') ?? '').toLowerCase();
  const list = tokens.filter((t) => !q || t.name.toLowerCase().includes(q));
  const hues = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'neutral', 'brand'];
  const steps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
  const byName = new Map(tokens.map((t) => [t.name, t]));

  const palette = hues
    .map(
      (h) =>
        `<span class="palette__label">${esc(h)}</span>${steps
          .map((s) => {
            const t = byName.get(`color.${h}.${s}`);
            return t ? `<span class="palette__chip" data-bg="${esc(t.value)}" role="img" aria-label="${esc(`${h} ${s}: ${t.value}`)}" title="${esc(`${t.name} ${t.value}`)}"></span>` : '<span></span>';
          })
          .join('')}`,
    )
    .join('');

  const semantic = list.filter((t) => t.type === 'color' && t.layer === 'semantic');
  const groups = [...new Set(semantic.map((t) => t.name.split('.')[1]))];
  const swatch = (t) =>
    `<div class="swatch"><span class="swatch__chips" role="img" aria-label="${esc(`${t.name}: ${fmt(t.value)}`)}"><span class="swatch__chip" data-bg="${esc(modeVal(t.value, 'light'))}"></span><span class="swatch__chip" data-bg="${esc(modeVal(t.value, 'dark'))}"></span></span><span class="swatch__name">${esc(t.name.replace(/^color\./, ''))}</span><span class="swatch__meta">${esc(t.aliasOf ? fmt(t.aliasOf) : fmt(t.value))}</span></div>`;

  const typo = list.filter((t) => t.type === 'typography');
  const spacing = list.filter((t) => t.name.startsWith('space.'));
  const other = list.filter((t) => t.type !== 'color' && t.type !== 'typography' && !t.name.startsWith('space.'));

  render(
    'Tokens',
    `<h1>Tokens</h1>
    <p class="lead">Semantic tokens inherit from the base palette and have light and dark values. Swatches show <strong>light | dark</strong>. Theme: <strong>${esc(state.theme || 'default')}</strong>.</p>
    <form class="row" id="token-filter" role="search" aria-label="Filter tokens">
      ${field('Filter tokens', input('token-q', { value: q, placeholder: 'e.g. text, space, heading' }), { id: 'token-q' })}
      ${btn('Filter', { type: 'submit', variant: 'secondary' })}
    </form>
    ${q ? `<p class="muted" role="status">${list.length} tokens match “${esc(q)}”.</p>` : `<h2>Base palette</h2><div class="palette" aria-label="Base palette, 10 steps per hue"><span></span>${steps.map((s) => `<span class="palette__label">${s}</span>`).join('')}${palette}</div>`}
    ${groups.map((g) => `<h2>color.${esc(g)}</h2><div class="swatches">${semantic.filter((t) => t.name.split('.')[1] === g).map(swatch).join('')}</div>`).join('')}
    ${typo.length ? `<h2>Typography</h2><div class="stack">${typo.map((t) => `<div><p class="ds-text-${esc(t.name.replace(/^typography\./, '').replace(/\./g, '-'))}">The quick brown fox — ${esc(t.name.replace(/^typography\./, ''))}</p><p class="muted"><code>${esc(t.cssVar)}</code> ${esc(fmt(t.value))}</p></div>`).join('')}</div>` : ''}
    ${spacing.length ? `<h2>Spacing</h2>${table('Spacing scale', ['Token', 'Value', 'Preview', 'CSS variable'], spacing.map((t) => [esc(t.name), esc(t.value), `<span class="palette__chip" data-bg="var(--ds-color-intent-primary-bg)" data-w="${esc(t.value)}" aria-hidden="true"></span>`, `<code>${esc(t.cssVar)}</code>`]))}` : ''}
    ${other.length ? `<h2>Other tokens</h2>${table('Other tokens', ['Token', 'Type', 'Value', 'CSS variable'], other.map((t) => [esc(t.name), esc(t.type), esc(fmt(t.value)), `<code>${esc(t.cssVar)}</code>`]))}` : ''}`,
  );
  $('#token-filter').addEventListener('submit', (e) => {
    e.preventDefault();
    location.hash = `#/tokens?q=${encodeURIComponent($('#token-q').value)}`;
  });
}

async function componentsView() {
  const list = await api('/components');
  setSubnav('components', list);
  render(
    'Components',
    `<h1>Components</h1><p class="lead">${list.length} components, each available for web (<code>@lockin/react</code>) and mobile (<code>@lockin/react-native</code>) with a machine-readable spec.</p>
    <div class="grid">${list
      .map(
        (c) => `<a class="card ds-focus-ring" href="#/components/${esc(c.slug)}"><span class="card__title">${esc(c.name)}</span><span class="row">${tag(c.status, TONE[c.status])} ${tag(`v${c.version}`)} ${tag(c.category)}</span><span class="muted">${esc(c.purpose)}</span></a>`,
      )
      .join('')}</div>`,
  );
}

async function componentView(slug) {
  const [c, history, stories] = await Promise.all([
    api(`/components/${encodeURIComponent(slug)}`),
    api(`/components/${encodeURIComponent(slug)}/history`),
    api(`/components/${encodeURIComponent(slug)}/stories`).catch(() => []),
  ]);
  const a = c.accessibility;
  let gallery = '';
  if (c.slug === 'icon') {
    const icons = await api('/icons');
    gallery = `<h2>Icon set</h2><div class="swatches">${icons
      .map((i) => `<div class="swatch"><svg class="ds-icon" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${i.paths.map((d) => `<path d="${esc(d)}"/>`).join('')}</svg><span class="swatch__name">${esc(i.name)}</span><span class="swatch__meta">${esc(i.keywords.join(', '))}</span></div>`)
      .join('')}</div>`;
  }
  render(
    c.name,
    `<p><a class="ds-link ds-link--subtle" href="#/components">Components</a></p>
    <h1>${esc(c.name)}</h1>
    <p class="row">${tag(c.status, TONE[c.status])} ${tag(`v${c.version}`)} ${tag(c.category)}</p>
    <p class="lead">${esc(c.purpose)}</p>
    ${liveExample(c, stories)}
    <h2>Import</h2>${code(`// Web\n${c.import.web}\n// React Native\n${c.import.native}`)}
    <h2>Examples</h2><h3>Web</h3>${code(c.usage.example.web)}<h3>React Native</h3>${code(c.usage.example.native)}
    <h2>Usage</h2>
    <div class="do-dont"><div class="card"><h3>Do</h3><ul>${c.usage.do.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div class="card dont"><h3>Don't</h3><ul>${c.usage.dont.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
    <h3>Related</h3><ul>${c.usage.related.map((r) => `<li><a class="ds-link" href="#/search?q=${encodeURIComponent(r.name)}">${esc(r.name)}</a> — ${esc(r.reason)}</li>`).join('')}</ul>
    <h2>Props</h2>${table(`${c.name} props`, ['Prop', 'Type', 'Default', 'Required', 'Description'], c.props.map((p) => [`<code>${esc(p.name)}</code>${p.platforms ? ` ${tag(p.platforms.join(' + '))}` : ''}`, `<code>${esc(p.type)}</code>`, p.default === undefined ? '—' : `<code>${esc(JSON.stringify(p.default))}</code>`, p.required ? 'Yes' : 'No', esc(p.description)]))}
    <h2>Variants</h2>${table(`${c.name} variants`, ['Variant', 'Description', 'Use when'], c.variants.map((v) => [esc(v.name), esc(v.description), esc(v.useWhen ?? '—')]))}
    <h2>States</h2>${table(`${c.name} states`, ['State', 'Description'], c.states.map((s) => [esc(s.name), esc(s.description)]))}
    <h2>Accessibility</h2>
    <p><strong>Role:</strong> ${esc(a.role)}</p><p><strong>Focus:</strong> ${esc(a.focus)}</p>${a.touchTarget ? `<p><strong>Touch target:</strong> ${esc(a.touchTarget)}</p>` : ''}
    ${a.keyboard.length ? table('Keyboard interactions', ['Keys', 'Action'], a.keyboard.map((k) => [`<kbd>${esc(k.keys)}</kbd>`, esc(k.action)])) : ''}
    <h3>Screen readers</h3><ul>${a.screenReader.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    ${a.notes?.length ? `<h3>Notes</h3><ul>${a.notes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
    <h3>WCAG 2.1 / IBM requirements</h3><p class="row">${a.wcag.map((w) => tag(w, 'info')).join(' ')}</p>
    <h2>Tokens</h2>${table(`${c.name} tokens`, ['Token', 'Usage'], c.tokens.map((t) => [`<a class="ds-link" href="#/tokens?q=${encodeURIComponent(t.token)}"><code>${esc(t.token)}</code></a>`, esc(t.usage)]))}
    ${gallery}
    <h2>History</h2>${table('Change history', ['Date', 'Change', 'Version', 'By'], history.map((h) => [esc(date(h.createdAt)), esc(h.summary ?? h.action), esc(`${h.versionFrom ?? '—'} → ${h.versionTo ?? '—'}`), esc(h.actor)]), { rowHeader: false })}
    <h2>Raw spec (JSON)</h2>${code(JSON.stringify(c, null, 2))}`,
  );
  bindLiveExample(c);
}

// ---------- live examples (stories from the static Storybook build) ----------

/** Storybook's bare story canvas, following the hub's color mode and theme. */
function storyUrl(id) {
  const mode = localStorage.getItem('ds-color-mode') ?? 'system';
  const globals = `colorMode:${mode};theme:${state.theme || 'default'}`;
  return `/storybook/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&globals=${encodeURIComponent(globals)}`;
}

/** Figma's view-only embed of the component's node in the library file (no footer or page picker). */
function figmaUrl(figma) {
  const mode = localStorage.getItem('ds-color-mode') ?? 'system';
  const params = new URLSearchParams({ 'node-id': figma.nodeId.replace(':', '-'), 'embed-host': 'lockin', footer: 'false', 'page-selector': 'false', theme: mode });
  return `https://embed.figma.com/design/${encodeURIComponent(figma.fileKey)}?${params}`;
}

function codeExample(c, stories) {
  if (!stories.length) {
    return `<p class="muted">No live example: build Storybook with <code>npm run build:storybook</code> to embed ${esc(c.name)}'s stories here.</p>`;
  }
  const [first] = stories;
  return `<div class="live" data-category="${esc(c.category)}">
      ${stories.length > 1 ? `<div class="live__stories" role="group" aria-label="${esc(c.name)} examples">${stories
        .map((s, i) => btn(s.name, { variant: i === 0 ? 'secondary' : 'tertiary', size: 'sm', attrs: `data-story="${esc(s.id)}" data-name="${esc(s.name)}" aria-pressed="${i === 0}"` }))
        .join('')}</div>` : ''}
      <iframe class="live__frame" id="live-frame" src="${esc(storyUrl(first.id))}" data-story="${esc(first.id)}" title="${esc(`${c.name} live example: ${first.name}`)}"></iframe>
      <p class="live__footer"><a class="ds-link" id="live-open" href="/storybook/?path=/story/${esc(first.id)}" target="_blank" rel="noopener noreferrer">Open in Storybook<span class="ds-visually-hidden"> (opens in a new tab)</span></a> <span class="muted">for controls and accessibility checks.</span></p>
    </div>`;
}

/** Code (Storybook) and, when the spec links a Figma node, Design tabs, using Lock In's Tabs markup. */
function liveExample(c, stories) {
  if (!c.figma) return `<h2>Live example</h2>${codeExample(c, stories)}`;
  const tabs = [
    ['code', 'Code', codeExample(c, stories)],
    [
      'design',
      'Design',
      // The src is set on first open: Figma embeds are heavy.
      `<div class="live"><iframe class="live__frame live__frame--figma" id="figma-frame" data-file-key="${esc(c.figma.fileKey)}" data-node-id="${esc(c.figma.nodeId)}" title="${esc(`${c.name} design in Figma (view only)`)}" allowfullscreen></iframe>
        <p class="live__footer muted">View only, from the Lock In Figma library.</p></div>`,
    ],
  ];
  return `<h2 id="live-heading">Live example</h2>
    <div class="ds-tabs ds-tabs--line">
      <div role="tablist" class="ds-tabs__list" aria-orientation="horizontal" aria-labelledby="live-heading">${tabs
        .map(([id, label], i) => `<button type="button" role="tab" id="live-tab-${id}" aria-controls="live-panel-${id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" class="ds-tabs__tab ds-focus-ring" data-tab="${id}"><span>${label}</span></button>`)
        .join('')}</div>
      ${tabs.map(([id, , content], i) => `<div role="tabpanel" id="live-panel-${id}" aria-labelledby="live-tab-${id}" class="ds-tabs__panel ds-focus-ring" tabindex="0" ${i === 0 ? '' : 'hidden'}>${content}</div>`).join('')}
    </div>`;
}

function bindLiveTabs(c) {
  const tabs = $$('[role="tab"][data-tab]', main);
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $(`#${t.getAttribute('aria-controls')}`).hidden = !on;
    });
    const figma = $('#figma-frame');
    if (tab.dataset.tab === 'design' && figma && !figma.src) figma.src = figmaUrl(c.figma);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    // Automatic activation with arrow keys / Home / End, as in the Tabs component.
    t.addEventListener('keydown', (e) => {
      const next = { ArrowRight: tabs[(i + 1) % tabs.length], ArrowLeft: tabs[(i - 1 + tabs.length) % tabs.length], Home: tabs[0], End: tabs[tabs.length - 1] }[e.key];
      if (!next) return;
      e.preventDefault();
      next.focus();
      select(next);
    });
  });
}

function bindLiveExample(c) {
  bindLiveTabs(c);
  const frame = $('#live-frame');
  if (!frame) return;
  // Grow the frame to fit the story (same origin, so we can measure it). Grow-only within a story,
  // so opened menus don't make the page jump back when they close.
  let observer;
  frame.addEventListener('load', () => {
    observer?.disconnect();
    frame.style.height = '';
    const doc = frame.contentDocument;
    if (!doc?.body) return;
    const fit = () => {
      const h = doc.documentElement.scrollHeight;
      if (h > frame.offsetHeight) frame.style.height = `${h}px`;
    };
    observer = new ResizeObserver(fit);
    observer.observe(doc.body);
    fit();
  });
  $$('.live__stories [data-story]', main).forEach((b) =>
    b.addEventListener('click', () => {
      $$('.live__stories [data-story]', main).forEach((o) => {
        const on = o === b;
        o.setAttribute('aria-pressed', String(on));
        o.classList.toggle('ds-button--secondary', on);
        o.classList.toggle('ds-button--tertiary', !on);
      });
      frame.dataset.story = b.dataset.story;
      frame.title = `${c.name} live example: ${b.dataset.name}`;
      frame.src = storyUrl(b.dataset.story);
      $('#live-open').href = `/storybook/?path=/story/${b.dataset.story}`;
      announce(`Showing ${b.dataset.name}`);
    }),
  );
}

/** Keep an open live example in sync with the color mode / theme pickers. */
function refreshLiveExample() {
  const frame = $('#live-frame');
  if (frame) frame.src = storyUrl(frame.dataset.story);
  // Only the embed's UI theme follows; Figma can't switch variable modes from the URL.
  const figma = $('#figma-frame');
  if (figma?.src) figma.src = figmaUrl(figma.dataset);
}

async function docsView() {
  const docs = await api('/docs');
  setSubnav('docs', docs);
  render('Docs', `<h1>Docs</h1><p class="lead">Guides for using and extending Lock In.</p><div class="grid">${docs.map((d) => `<a class="card ds-focus-ring" href="#/docs/${esc(d.slug)}"><span class="card__title">${esc(d.title)}</span><span class="muted">${esc(d.summary)}</span></a>`).join('')}</div>`);
}

async function docView(slug) {
  const doc = await api(`/docs/${encodeURIComponent(slug)}?format=html`);
  // Server renders markdown with raw HTML escaped, so this is safe to insert.
  render(doc.title, `<p><a class="ds-link ds-link--subtle" href="#/docs">Docs</a></p><article class="doc">${doc.content}</article>`);
  $$('.doc a[href^="http"]', main).forEach((a) => {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.insertAdjacentHTML('beforeend', '<span class="ds-visually-hidden"> (opens in a new tab)</span>');
  });
}

async function changesView() {
  const [changes, releases, pending] = await Promise.all([api('/changes?limit=100'), api('/releases'), api('/changes?unreleased=true&limit=500')]);
  render(
    'Changes',
    `<h1>Changes</h1><p class="lead">Every edit to tokens, components and docs is tracked. Releases snapshot the whole system.</p>
    ${can('admin') ? `<h2>Cut a release</h2><p>${pending.length} unreleased change(s).</p><form class="form" id="release-form">${field('Version bump', select('rel-bump', [['minor', 'Minor (new features)'], ['patch', 'Patch (fixes)'], ['major', 'Major (breaking)']]), { id: 'rel-bump' })}<div class="ds-field"><label class="ds-field__label" for="rel-notes">Release notes</label><textarea id="rel-notes" class="textarea"></textarea></div><div>${btn('Create release', { type: 'submit' })}</div></form>` : ''}
    <h2>Releases</h2>${table('Releases', ['Version', 'Date', 'Notes', 'By'], releases.map((r) => [esc(r.version), esc(date(r.createdAt)), esc(r.notes || '—'), esc(r.actor)]))}
    <h2>Recent changes</h2>${table('Recent changes', ['Entity', 'Change', 'Version', 'Release', 'By', 'Date'], changes.map((c) => [`${tag(c.entityType)} <code>${esc(c.entityId)}</code>`, esc(c.summary ?? c.action), esc(c.versionTo ? `${c.versionFrom ?? '—'} → ${c.versionTo}` : '—'), c.release ? esc(c.release) : tag('unreleased', 'warning'), esc(c.actor), esc(date(c.createdAt))]))}`,
  );
  $('#release-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await api('/releases', { method: 'POST', body: { bump: $('#rel-bump').value, notes: $('#rel-notes').value } });
    await changesView();
    announce(`Released v${res.version}.`);
  });
}

async function settingsView() {
  if (isAnonymous()) {
    render(
      'Settings',
      `<h1>Settings</h1>
      <p class="lead">Browsing is open to everyone. Sign in with an API key to edit tokens, components and docs, cut releases or manage keys.</p>
      ${loginForm()}`,
    );
    return bindLoginForm();
  }
  const keys = can('admin') ? await api('/keys') : [];
  render(
    'Settings',
    `<h1>Settings</h1>
    <p>Signed in as <strong>${esc(state.me.name)}</strong> with role ${tag(state.me.role, 'brand')}.</p>
    <p>${btn('Sign out', { variant: 'secondary', attrs: 'id="sign-out"' })}</p>
    ${can('admin') ? `<h2>API keys</h2>
      <div id="new-key"></div>
      ${table('API keys', ['Name', 'Role', 'Prefix', 'Created', 'Last used', 'Status', ''], keys.map((k) => [esc(k.name), esc(k.role), `<code>${esc(k.prefix)}…</code>`, esc(date(k.created_at)), esc(k.last_used_at ? date(k.last_used_at) : '—'), k.revoked_at ? tag('revoked', 'danger') : tag('active', 'success'), k.revoked_at ? '' : btn('Revoke', { variant: 'danger', size: 'sm', attrs: `data-revoke="${esc(k.id)}" aria-label="Revoke key ${esc(k.name)}"` })]))}
      <h3>Create a key</h3>
      <form class="form" id="key-form">${field('Name', input('key-name', { required: true, placeholder: 'e.g. claude-agent, arena-app' }), { id: 'key-name' })}${field('Role', select('key-role', [['viewer', 'Viewer — read only'], ['editor', 'Editor — modify the system'], ['admin', 'Admin — releases + keys']]), { id: 'key-role' })}<div>${btn('Create key', { type: 'submit' })}</div></form>` : ''}`,
  );
  $('#sign-out').addEventListener('click', () => {
    localStorage.removeItem('ds-api-key');
    state.key = '';
    state.me = null;
    boot();
  });
  $('#key-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const created = await api('/keys', { method: 'POST', body: { name: $('#key-name').value, role: $('#key-role').value } });
    await settingsView();
    $('#new-key').innerHTML = `${notice('Copy this key now — it will not be shown again.', 'success')}${code(created.key)}`;
    announce('Key created. Copy it now; it will not be shown again.');
  });
  $$('[data-revoke]', main).forEach((b) =>
    b.addEventListener('click', async () => {
      if (!confirm('Revoke this key? Apps using it will lose access.')) return;
      await api(`/keys/${b.dataset.revoke}`, { method: 'DELETE' });
      await settingsView();
      announce('Key revoked.');
    }),
  );
}

async function searchView(params) {
  const q = params.get('q') ?? '';
  $('#search-input').value = q;
  const { results } = await api(`/search?q=${encodeURIComponent(q)}`);
  const href = (r) => ({ component: `#/components/${r.id}`, doc: `#/docs/${r.id}`, token: `#/tokens?q=${encodeURIComponent(r.id)}`, icon: '#/components/icon' })[r.type];
  render(
    `Search: ${q}`,
    `<h1>Search</h1><p role="status">${results.length} result(s) for “${esc(q)}”.</p>
    <div class="stack">${results.map((r) => `<a class="card ds-focus-ring" href="${href(r)}"><span class="row">${tag(r.type, 'brand')} <span class="card__title">${esc(r.title)}</span></span><span class="muted">${esc(r.snippet)}</span></a>`).join('')}</div>`,
  );
}

// ---------- sidebar ----------

/** Fill a section's sub-navigation (components, docs) from its list. */
function setSubnav(section, items) {
  $(`#subnav-${section}`).innerHTML = items
    .map((i) => `<li><a href="#/${section}/${esc(i.slug)}" class="nav-link nav-link--sub ds-focus-ring">${esc(i.name ?? i.title)}</a></li>`)
    .join('');
  updateNav(location.hash.replace(/^#/, '').split('?')[0]);
}

/** The current page's link gets aria-current="page"; its section stays marked and shows its sub-links. */
function updateNav(path) {
  const page = path === '' ? '/' : path;
  $$('.nav-link').forEach((a) => {
    const target = a.getAttribute('href').slice(1);
    const inSection = target !== '/' && page.startsWith(`${target}/`);
    if (target === page) a.setAttribute('aria-current', 'page');
    else if (inSection) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
  $$('.subnav').forEach((ul) => {
    const target = ul.previousElementSibling.getAttribute('href').slice(1);
    ul.hidden = !(page === target || page.startsWith(`${target}/`));
  });
}

// ---------- router ----------

const routes = [
  [/^\/?$/, overview],
  [/^\/tokens$/, tokensView],
  [/^\/components$/, componentsView],
  [/^\/components\/([\w-]+)$/, componentView],
  [/^\/docs$/, docsView],
  [/^\/docs\/([\w-]+)$/, docView],
  [/^\/changes$/, changesView],
  [/^\/settings$/, settingsView],
  [/^\/search$/, searchView],
];

async function route() {
  if (!state.me) return;
  const [path, query = ''] = location.hash.replace(/^#/, '').split('?');
  const params = new URLSearchParams(query);
  updateNav(path);
  for (const [re, view] of routes) {
    const m = path.match(re);
    if (!m) continue;
    try {
      await (m[1] ? view(m[1], params) : view(params));
    } catch (err) {
      if (err instanceof AuthError) return loginView('Your API key is invalid or was revoked.');
      render('Error', `<h1>Something went wrong</h1>${notice(err.data?.details ? `${err.message}: ${JSON.stringify(err.data.details)}` : err.message, 'danger')}`);
    }
    return;
  }
  render('Not found', '<h1>Page not found</h1><p><a class="ds-link" href="#/">Go to overview</a></p>');
}

async function boot() {
  try {
    // Works without a key when the server allows public read access.
    state.me = await api('/me');
  } catch {
    state.me = null;
    return loginView(state.key ? 'That API key was not accepted.' : '');
  }
  const [health, themes, components, docs] = await Promise.all([fetch('/api/health').then((r) => r.json()), api('/themes'), api('/components'), api('/docs')]);
  setSubnav('components', components);
  setSubnav('docs', docs);
  $('#version').textContent = `v${health.version}`;
  const themeSelect = $('#theme-select');
  themeSelect.innerHTML = `<option value="">Default</option>${themes.map((t) => `<option value="${esc(t.name)}">${esc(t.name)} — ${esc(t.brand)}</option>`).join('')}`;
  themeSelect.value = state.theme;
  await route();
}

$('#mode-select').value = savedMode;
$('#mode-select').addEventListener('change', (e) => {
  applyMode(e.target.value);
  refreshLiveExample();
});
$('#theme-select').addEventListener('change', (e) => {
  applyTheme(e.target.value);
  refreshLiveExample();
  if (location.hash.startsWith('#/tokens')) route();
});
$('#search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  location.hash = `#/search?q=${encodeURIComponent($('#search-input').value)}`;
});
window.addEventListener('hashchange', route);
boot();
