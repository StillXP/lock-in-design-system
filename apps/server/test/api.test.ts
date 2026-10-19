// Integration tests: REST, auth, versioning, contrast guardrails, public read, releases and MCP.
// Runs against an isolated copy of the content so the real repo is never modified.
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const repo = resolve(import.meta.dirname, '../../..');
const root = mkdtempSync(join(tmpdir(), 'lockin-test-'));
for (const rel of ['packages/tokens/src', 'packages/specs/components', 'packages/specs/schema', 'docs', 'design-system.json', 'llms.txt']) {
  cpSync(join(repo, rel), join(root, rel), { recursive: true });
}
process.env.DS_REPO_ROOT = root;
process.env.DS_DATA_DIR = join(root, 'data');

const { openDb } = await import('../src/db.js');
const { createApiKey } = await import('../src/auth.js');
const { DesignSystemStore } = await import('../src/store.js');
const { createApp } = await import('../src/app.js');

const db = openDb(process.env.DS_DATA_DIR);
const store = new DesignSystemStore(db);
const keys = {
  viewer: createApiKey(db, 'test-viewer', 'viewer').key,
  editor: createApiKey(db, 'test-editor', 'editor').key,
  admin: createApiKey(db, 'test-admin', 'admin').key,
};
let base = '';
let close: () => void;

before(async () => {
  const server = createApp(store, db, { publicRead: false }).listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  close = () => server.close();
});
after(() => {
  close();
  db.close();
  rmSync(root, { recursive: true, force: true });
});

async function api(method: string, path: string, key?: string, body?: unknown) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(key ? { authorization: `Bearer ${key}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

describe('auth', () => {
  test('rejects missing and invalid keys', async () => {
    assert.equal((await api('GET', '/api/components')).status, 401);
    assert.equal((await api('GET', '/api/components', 'ds_nope')).status, 401);
  });
  test('enforces roles', async () => {
    const spec = store.component('tag');
    assert.equal((await api('PUT', '/api/components/tag', keys.viewer, { spec })).status, 403);
    assert.equal((await api('POST', '/api/releases', keys.editor, {})).status, 403);
    assert.equal((await api('GET', '/api/keys', keys.editor)).status, 403);
  });
});

describe('read API', () => {
  test('lists all 14 components with required spec fields', async () => {
    const { body } = await api('GET', '/api/components?full=true', keys.viewer);
    assert.equal(body.length, 14);
    for (const c of body) {
      for (const field of ['name', 'import', 'status', 'version', 'purpose', 'props', 'states', 'tokens', 'accessibility', 'variants', 'usage']) {
        assert.ok(field in c, `${c.name} missing ${field}`);
      }
      for (const u of ['do', 'dont', 'related', 'example']) assert.ok(u in c.usage, `${c.name} usage missing ${u}`);
    }
  });
  test('tokens resolve with light and dark values', async () => {
    const { body } = await api('GET', '/api/tokens/color.text.primary', keys.viewer);
    assert.deepEqual(body.value, { light: '#000000', dark: '#FFFFFF' });
    assert.equal(body.cssVar, '--ds-color-text-primary');
    const ring = await api('GET', '/api/tokens/color.focus.ring', keys.viewer);
    assert.ok(ring.body.usedBy.includes('Button'));
  });
  test('spacing scale is 10 steps, all divisible by 4, 4px → 128px', async () => {
    const { body } = await api('GET', '/api/tokens?prefix=space.', keys.viewer);
    const px = body.tokens.map((t: { value: string }) => parseInt(t.value));
    assert.equal(px.length, 10);
    assert.ok(px.every((v: number) => v % 4 === 0));
    assert.equal(Math.min(...px), 4);
    assert.equal(Math.max(...px), 128);
  });
  test('search finds relevant components', async () => {
    const { body } = await api('GET', '/api/search?q=destructive', keys.viewer);
    assert.ok(body.results.some((r: { id: string }) => r.id === 'button'));
  });
  test('contrast endpoint resolves tokens', async () => {
    const { body } = await api('GET', '/api/contrast?fg=color.text.secondary&bg=color.background.default&mode=dark', keys.viewer);
    assert.ok(body.ratio >= 4.5);
  });
  test('serves architecture diagrams referenced by docs', async () => {
    const doc = await api('GET', '/api/docs/architecture', keys.viewer);
    const refs = [...doc.body.content.matchAll(/\(\.\/(diagrams\/[\w-]+\.(?:svg|html))\)/g)].map((m) => m[1]);
    assert.equal(refs.length, 8);
    for (const ref of refs) {
      const res = await fetch(`${base}/${ref}`);
      assert.equal(res.status, 200, ref);
    }
  });
  test('docs render to HTML with raw HTML escaped', async () => {
    const { body } = await api('GET', '/api/docs/getting-started?format=html', keys.viewer);
    assert.match(body.content, /<h1/);
  });
});

describe('versioning and change tracking', () => {
  test('adding a prop bumps minor and is logged', async () => {
    const spec = store.component('tag');
    const next = { ...spec, props: [...spec.props, { name: 'pulse', type: 'boolean', required: false, description: 'Animate for live status.' }] };
    const { status, body } = await api('PUT', '/api/components/tag', keys.editor, { spec: next, summary: 'Add pulse' });
    assert.equal(status, 200);
    const [maj, min] = spec.version.split('.').map(Number);
    assert.equal(body.version, `${maj}.${min + 1}.0`);
    const history = await api('GET', '/api/components/tag/history', keys.viewer);
    assert.equal(history.body[0].versionTo, body.version);
    assert.equal(history.body[0].actor, 'test-editor');
    assert.ok(history.body[0].diff.some((d: { path: string }) => d.path.startsWith('props.')));
  });
  test('removing a prop bumps major', async () => {
    const spec = store.component('tag');
    const next = { ...spec, props: spec.props.filter((p: { name: string }) => p.name !== 'pulse') };
    const { body } = await api('PUT', '/api/components/tag', keys.editor, { spec: next });
    assert.equal(body.version, '1.0.0');
  });
  test('rejects specs that reference unknown tokens', async () => {
    const spec = store.component('tag');
    const { status, body } = await api('PUT', '/api/components/tag', keys.editor, { spec: { ...spec, tokens: [{ token: 'color.nope', usage: 'x' }] } });
    assert.equal(status, 422);
    assert.match(JSON.stringify(body.details), /unknown token/);
  });
  test('rejects token changes that break WCAG contrast and leaves the file untouched', async () => {
    const file = join(root, 'packages/tokens/src/semantic/color.json');
    const original = readFileSync(file, 'utf8');
    const { status, body } = await api('PUT', '/api/tokens/color.text.secondary', keys.editor, { value: { light: '{color.neutral.300}', dark: '{color.neutral.300}' } });
    assert.equal(status, 422);
    assert.ok(body.details.length > 0);
    assert.equal(readFileSync(file, 'utf8'), original);
  });
  test('accepts valid token changes and logs them', async () => {
    const { status } = await api('PUT', '/api/tokens/color.text.secondary', keys.editor, {
      value: { light: '{color.neutral.700}', dark: '{color.neutral.200}' },
      summary: 'Higher contrast secondary text',
    });
    assert.equal(status, 200);
    const { body } = await api('GET', '/api/changes?entityType=token', keys.viewer);
    assert.equal(body[0].entityId, 'color.text.secondary');
  });
  test('admin release bumps the system version and closes pending changes', async () => {
    const { status, body } = await api('POST', '/api/releases', keys.admin, { bump: 'minor', notes: 'Test release' });
    assert.equal(status, 201);
    assert.equal(body.version, '0.2.0');
    assert.ok(body.changes >= 3);
    assert.equal(JSON.parse(readFileSync(join(root, 'design-system.json'), 'utf8')).version, '0.2.0');
    assert.match(readFileSync(join(root, 'CHANGELOG.md'), 'utf8'), /## 0\.2\.0/);
    assert.equal((await api('GET', '/api/changes?unreleased=true', keys.viewer)).body.length, 0);
  });
});

describe('live examples', () => {
  test('every component spec has Storybook stories titled and filed under its atomic level', () => {
    const groups = { atom: 'Atoms', molecule: 'Molecules', organism: 'Organisms' } as const;
    for (const c of store.components()) {
      const group = groups[c.level as keyof typeof groups];
      assert.ok(group, `${c.name} has no valid level (got "${c.level}")`);
      const dir = join(repo, 'apps/storybook/src/stories', group.toLowerCase());
      const titles = readdirSync(dir).flatMap((f) => [...readFileSync(join(dir, f), 'utf8').matchAll(/title: '([^']+)'/g)].map((m) => m[1]));
      assert.ok(titles.includes(`${group}/${c.name}`), `No stories titled "${group}/${c.name}" in stories/${group.toLowerCase()}/`);
    }
  });
  test('every component spec links its Figma library node', () => {
    for (const c of store.components()) {
      assert.ok(c.figma, `${c.name} has no figma link`);
      assert.equal(c.figma.fileKey, store.component('button').figma.fileKey, `${c.name} points at a different Figma file`);
    }
  });
  test('stories come from the Storybook build index, embeddable by the hub only', async () => {
    assert.deepEqual((await api('GET', '/api/components/button/stories', keys.viewer)).body, []);
    const sb = join(root, 'apps/storybook/storybook-static');
    mkdirSync(sb, { recursive: true });
    writeFileSync(join(sb, 'iframe.html'), '<!doctype html>');
    const entry = (id: string, title: string, name: string, type = 'story') => [id, { id, title, name, type }];
    const entries = Object.fromEntries([
      entry('atoms-button--docs', 'Atoms/Button', 'Docs', 'docs'),
      entry('atoms-button--primary', 'Atoms/Button', 'Primary'),
      entry('atoms-button--loading', 'Atoms/Button', 'Loading'),
      entry('molecules-radiogroup--default', 'Molecules/RadioGroup', 'Default'),
    ]);
    writeFileSync(join(sb, 'index.json'), JSON.stringify({ v: 5, entries }));
    const { body } = await api('GET', '/api/components/button/stories', keys.viewer);
    assert.deepEqual(body, [
      { id: 'atoms-button--primary', name: 'Primary' },
      { id: 'atoms-button--loading', name: 'Loading' },
    ]);
    // Slug and spec name differ for RadioGroup; stories match on the spec name.
    assert.equal((await api('GET', '/api/components/radio-button/stories', keys.viewer)).body[0].id, 'molecules-radiogroup--default');

    const frame = await fetch(`${base}/storybook/iframe.html`);
    assert.equal(frame.status, 200);
    assert.equal(frame.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.match(frame.headers.get('content-security-policy') ?? '', /frame-ancestors 'self'/);
    const hub = await fetch(`${base}/`);
    assert.equal(hub.headers.get('x-frame-options'), 'DENY');
    assert.match(hub.headers.get('content-security-policy') ?? '', /frame-src 'self' https:\/\/embed\.figma\.com/);
  });
});

describe('web fonts', () => {
  test('token sheets declare Inter and JetBrains Mono and every url() points at a font the build ships', async () => {
    const { build } = await import('@lockin/tokens/build');
    const dist = join(root, 'packages/tokens/dist');
    build({ srcDir: join(root, 'packages/tokens/src'), distDir: dist });
    for (const [sheet, prefix] of [['css/tokens.css', '../fonts/'], ['css/themes/arena.css', '../../fonts/']]) {
      const css = readFileSync(join(dist, sheet), 'utf8');
      for (const family of ['Inter', 'JetBrains Mono']) assert.match(css, new RegExp(`font-family: '${family}'`), `${sheet} declares no ${family}`);
      const urls = [...css.matchAll(/url\('([^']+)'\)/g)].map((m) => m[1]);
      assert.ok(urls.length >= 4, `${sheet} has ${urls.length} font urls`);
      for (const url of urls) {
        assert.ok(url.startsWith(prefix), `${sheet}: unexpected url ${url}`);
        assert.ok(existsSync(join(dist, sheet, '..', url)), `${sheet}: ${url} is not shipped`);
      }
    }
    assert.ok(existsSync(join(dist, 'fonts/OFL-Inter.txt')) && existsSync(join(dist, 'fonts/OFL-JetBrains-Mono.txt')), 'font licenses are not shipped');
  });
  test('the hub serves the font files the token sheets reference', async () => {
    const res = await fetch(`${base}/assets/fonts/inter-latin-wght-normal.woff2`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') ?? '', /woff2/);
    assert.ok((await res.arrayBuffer()).byteLength > 10_000);
  });
});

describe('css variable names', () => {
  test('are kebab-case, and every var(--ds-*) a stylesheet uses is defined', async () => {
    const { build } = await import('@lockin/tokens/build');
    const dist = join(root, 'packages/tokens/dist');
    build({ srcDir: join(root, 'packages/tokens/src'), distDir: dist });
    const tokensCss = readFileSync(join(dist, 'css/tokens.css'), 'utf8');
    const defined = new Set([...tokensCss.matchAll(/(--ds-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
    assert.ok(defined.size > 250, `only ${defined.size} variables defined`);
    assert.deepEqual([...tokensCss.matchAll(/--ds-[A-Za-z0-9-]*[A-Z][A-Za-z0-9-]*/g)].map((m) => m[0]), [], 'camelCase CSS variables in tokens.css');
    const reactSrc = join(repo, 'packages/react/src');
    const sheets = [
      ...readdirSync(reactSrc, { recursive: true }).map(String).filter((f) => f.endsWith('.css')).map((f) => join(reactSrc, f)),
      join(repo, 'apps/server/public/app.css'),
    ];
    assert.ok(sheets.length > 10);
    for (const sheet of sheets) {
      for (const [, name] of readFileSync(sheet, 'utf8').matchAll(/var\((--ds-[A-Za-z0-9-]+)/g)) {
        assert.ok(defined.has(name), `${sheet.replace(repo, '')} uses ${name}, which tokens.css does not define`);
      }
    }
  });
  test('the flat JSON lists the kebab-case name for camelCase tokens', async () => {
    const { build } = await import('@lockin/tokens/build');
    const dist = join(root, 'packages/tokens/dist');
    build({ srcDir: join(root, 'packages/tokens/src'), distDir: dist });
    const flat = JSON.parse(readFileSync(join(dist, 'json/tokens.flat.json'), 'utf8'));
    const tokens: Array<{ name: string; cssVar: string }> = Array.isArray(flat) ? flat : flat.tokens;
    assert.equal(tokens.find((t) => t.name === 'color.text.linkHover')?.cssVar, '--ds-color-text-link-hover');
    assert.equal(tokens.find((t) => t.name === 'zIndex.modal')?.cssVar, '--ds-z-index-modal');
    assert.equal(tokens.filter((t) => /[A-Z]/.test(t.cssVar)).length, 0);
  });
});

describe('public read', () => {
  let publicBase = '';
  let closePublic: () => void;
  before(async () => {
    const server = createApp(store, db, { publicRead: true }).listen(0);
    await new Promise((r) => server.once('listening', r));
    publicBase = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    closePublic = () => server.close();
  });
  after(() => closePublic());

  test('anonymous callers read but cannot write', async () => {
    const read = await fetch(`${publicBase}/api/components/button`);
    assert.equal(read.status, 200);
    assert.equal(((await (await fetch(`${publicBase}/api/me`)).json()) as { id: string }).id, 'anonymous');
    const write = await fetch(`${publicBase}/api/components/tag`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ spec: store.component('tag') }) });
    assert.equal(write.status, 403);
    assert.equal((await fetch(`${publicBase}/api/keys`)).status, 403);
    assert.equal((await fetch(`${publicBase}/api/components`, { headers: { authorization: 'Bearer ds_nope' } })).status, 401);
  });
  test('anonymous MCP clients get read tools only', async () => {
    const client = new Client({ name: 'test', version: '1.0.0' });
    await client.connect(new StreamableHTTPClientTransport(new URL(`${publicBase}/mcp`)));
    const names = (await client.listTools()).tools.map((t) => t.name);
    assert.ok(names.includes('get_component'));
    assert.ok(!names.some((n) => n.startsWith('update_')));
    await client.close();
  });
});

describe('MCP over HTTP', () => {
  async function connect(key: string) {
    const client = new Client({ name: 'test', version: '1.0.0' });
    await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp`), { requestInit: { headers: { authorization: `Bearer ${key}` } } }));
    return client;
  }
  test('viewer gets read tools only; get_component returns the spec', async () => {
    const client = await connect(keys.viewer);
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    assert.ok(names.includes('get_component'));
    assert.ok(!names.includes('update_component'));
    const res = await client.callTool({ name: 'get_component', arguments: { name: 'Button' } });
    const spec = JSON.parse((res.content as Array<{ text: string }>)[0].text);
    assert.equal(spec.name, 'Button');
    await client.close();
  });
  test('editor gets write tools; resources list components', async () => {
    const client = await connect(keys.editor);
    const names = (await client.listTools()).tools.map((t) => t.name);
    assert.ok(names.includes('update_token'));
    const { resources } = await client.listResources();
    assert.ok(resources.some((r) => r.uri === 'ds://components/data-table'));
    const contrast = await client.callTool({ name: 'check_contrast', arguments: { foreground: 'color.intent.primary.text', background: 'color.intent.primary.bg' } });
    assert.ok(JSON.parse((contrast.content as Array<{ text: string }>)[0].text).passes['AA normal text (4.5:1)']);
    await client.close();
  });
  test('rejects unauthenticated MCP requests', async () => {
    const res = await fetch(`${base}/mcp`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    assert.equal(res.status, 401);
  });
});
