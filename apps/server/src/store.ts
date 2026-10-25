import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { icons, iconNames } from '@lockin/icons';
import { build as buildTokens } from '@lockin/tokens/build';
import { checkContrast, type ContrastResult } from '@lockin/tokens/check-contrast';
import {
  contrastRatio,
  cssVarName,
  listThemes,
  loadTokens,
  resolveAll,
  resolveToken,
  type RawToken,
} from '@lockin/tokens/lib/resolve';
import { validateSpec } from '@lockin/specs/validate';
import { Marked } from 'marked';
import { config } from './config.js';
import type { Db } from './db.js';
import { diffJson, listChanges, logChange, markReleased, saveRelease, type DiffEntry } from './history.js';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export type Bump = 'major' | 'minor' | 'patch';
type Spec = Record<string, any>;

/** Token path: dot-separated segments. `__proto__` is rejected separately so a name can't reach Object.prototype. */
const TOKEN_NAME = /^(?!(?:.*\.)?(?:__proto__|constructor|prototype)(?:\.|$))[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$/;

const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file: string, data: unknown) => writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);

/** Atomic design level (spec `level`) to the Storybook sidebar group its stories live under. */
const LEVEL_TITLES = { atom: 'Atoms', molecule: 'Molecules', organism: 'Organisms' } as const;

export function bumpVersion(version: string, bump: Bump): string {
  const [maj, min, pat] = version.split('.').map(Number);
  if (bump === 'major') return `${maj + 1}.0.0`;
  if (bump === 'minor') return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${pat + 1}`;
}

/**
 * Semver inference for component API changes:
 * removed/renamed props, changed prop types, or newly-required props → major;
 * new props, variants or states → minor; anything else (docs, guidance) → patch.
 */
export function inferBump(prev: Spec, next: Spec): Bump {
  const nextProps = new Map<string, Spec>((next.props ?? []).map((p: Spec) => [p.name, p]));
  for (const p of prev.props ?? []) {
    const n = nextProps.get(p.name);
    if (!n || n.type !== p.type || (!p.required && n.required)) return 'major';
  }
  const grew = (k: string) => (next[k]?.length ?? 0) > (prev[k]?.length ?? 0);
  if (grew('props') || grew('variants') || grew('states')) return 'minor';
  return 'patch';
}

// Markdown → HTML for docs. Raw HTML in markdown is escaped so docs can't inject script.
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const markdown = new Marked({ renderer: { html: ({ text }) => escapeHtml(text) } });

export interface FlatToken {
  name: string;
  cssVar: string;
  type?: string;
  layer?: string;
  description?: string;
  value: unknown;
  aliasOf?: unknown;
}

export class DesignSystemStore {
  private tokenCache = new Map<string, FlatToken[]>();

  constructor(private db: Db) {}

  // ---------- manifest ----------

  manifest(): { name: string; version: string; description: string } {
    return readJson(config.paths.manifest);
  }

  overview() {
    const m = this.manifest();
    return {
      ...m,
      counts: {
        tokens: this.tokens().length,
        components: this.components().length,
        docs: this.docs().length,
        icons: iconNames.length,
        themes: listThemes(config.paths.tokensSrc).length,
      },
      unreleasedChanges: listChanges(this.db, { unreleased: true, limit: 500 }).length,
    };
  }

  // ---------- tokens ----------

  themes() {
    return listThemes(config.paths.tokensSrc);
  }

  /** Flat, resolved token list (light + dark) — the AI-friendly shape. */
  tokens(theme?: string): FlatToken[] {
    const key = theme ?? '';
    const cached = this.tokenCache.get(key);
    if (cached) return cached;
    const resolved = resolveAll(loadTokens({ srcDir: config.paths.tokensSrc, theme: theme || null }));
    const list = [...resolved].map(([name, e]) => {
      const varies = JSON.stringify(e.values.light) !== JSON.stringify(e.values.dark);
      return {
        name,
        cssVar: cssVarName(name),
        type: e.token.type,
        layer: e.token.layer,
        description: e.token.description,
        value: varies ? { light: e.values.light, dark: e.values.dark } : e.values.light,
        aliasOf: e.refs.light ? (varies ? { light: e.refs.light, dark: e.refs.dark } : e.refs.light) : undefined,
      };
    });
    this.tokenCache.set(key, list);
    return list;
  }

  token(name: string, theme?: string) {
    const flat = this.tokens(theme).find((t) => t.name === name);
    if (!flat) throw new HttpError(404, `Token "${name}" not found`);
    const raw = loadTokens({ srcDir: config.paths.tokensSrc }).get(name)!;
    const usedBy = this.components()
      .filter((c) => c.tokens.some((t: Spec) => t.token === name))
      .map((c) => c.name);
    return { ...flat, source: { value: raw.value, file: raw.file && basename(raw.file), layer: raw.layer }, usedBy };
  }

  /** Update (or create) a token in its source file, rebuild outputs and enforce contrast. */
  saveToken(
    name: string,
    input: { value: unknown; type?: string; description?: string; layer?: 'base' | 'semantic' },
    actor: string,
    summary?: string,
  ) {
    if (!TOKEN_NAME.test(name)) throw new HttpError(400, 'Token names are dot-separated segments of letters, numbers, dashes and underscores');
    const tokens = loadTokens({ srcDir: config.paths.tokensSrc });
    const existing = tokens.get(name);
    const file = existing?.file ?? this.fileForNewToken(name, input.layer ?? 'semantic', tokens);
    if (!existing && !input.type) throw new HttpError(400, 'type is required when creating a token');

    const original = readFileSync(file, 'utf8');
    const json = JSON.parse(original);
    let node = json;
    for (const seg of name.split('.')) node = Object.hasOwn(node, seg) ? node[seg] : (node[seg] = {});
    const before = { $value: node.$value, $description: node.$description };
    node.$value = input.value;
    if (input.type && !existing) node.$type = input.type;
    if (input.description !== undefined) node.$description = input.description;
    writeJson(file, json);

    // Validate: references must resolve, and every contrast pair must still pass.
    try {
      const updated = loadTokens({ srcDir: config.paths.tokensSrc });
      resolveAll(updated);
      const failures = checkContrast(config.paths.tokensSrc).filter((r: ContrastResult) => !r.pass);
      if (failures.length) throw new HttpError(422, 'Change rejected: it breaks WCAG contrast requirements.', failures);
    } catch (err) {
      writeFileSync(file, original);
      if (err instanceof HttpError) throw err;
      throw new HttpError(422, `Change rejected: ${(err as Error).message}`);
    }

    buildTokens({ srcDir: config.paths.tokensSrc, distDir: config.paths.tokensDist });
    this.tokenCache.clear();
    const diff = diffJson(before, { $value: node.$value, $description: node.$description });
    logChange(this.db, { entityType: 'token', entityId: name, action: existing ? 'update' : 'create', summary, diff, actor });
    return this.token(name);
  }

  private fileForNewToken(name: string, layer: 'base' | 'semantic', tokens: Map<string, RawToken>) {
    // Prefer the file that already holds the closest parent group.
    const segments = name.split('.');
    for (let i = segments.length - 1; i > 0; i--) {
      const prefix = `${segments.slice(0, i).join('.')}.`;
      const sibling = [...tokens.values()].find((t) => t.path.startsWith(prefix) && t.layer === layer);
      if (sibling?.file) return sibling.file;
    }
    const file = join(config.paths.tokensSrc, layer, `${segments[0]}.json`);
    if (!existsSync(file)) writeJson(file, {});
    return file;
  }

  contrast(fg: string, bg: string, mode: 'light' | 'dark' = 'light', theme?: string) {
    const tokens = loadTokens({ srcDir: config.paths.tokensSrc, theme: theme || null });
    const toHex = (v: string) => {
      if (v.startsWith('#')) return v;
      const resolved = resolveToken(tokens, v, mode).value;
      if (typeof resolved !== 'string' || !resolved.startsWith('#')) throw new HttpError(400, `${v} does not resolve to an opaque hex color`);
      return resolved;
    };
    const [f, b] = [toHex(fg), toHex(bg)];
    const ratio = Math.round(contrastRatio(f, b) * 100) / 100;
    return {
      foreground: { input: fg, hex: f },
      background: { input: bg, hex: b },
      mode,
      ratio,
      passes: {
        'AA normal text (4.5:1)': ratio >= 4.5,
        'AA large text (3:1)': ratio >= 3,
        'AA UI components & focus (3:1)': ratio >= 3,
        'AAA normal text (7:1)': ratio >= 7,
      },
    };
  }

  // ---------- components ----------

  components(): Spec[] {
    return readdirSync(config.paths.specs)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .map((f) => readJson(join(config.paths.specs, f)));
  }

  component(nameOrSlug: string): Spec {
    const key = nameOrSlug.toLowerCase();
    const spec = this.components().find(
      (c) => c.slug === key || c.name.toLowerCase() === key || c.name.toLowerCase() === key.replace(/-/g, ''),
    );
    if (!spec) throw new HttpError(404, `Component "${nameOrSlug}" not found`);
    return spec;
  }

  /**
   * Stories for a component in the static Storybook build (title `<Atoms|Molecules|Organisms>/<spec name>`, from the spec's level), in file order.
   * Empty when Storybook hasn't been built, so the web UI can hide the live example.
   */
  componentStories(nameOrSlug: string): { id: string; name: string }[] {
    const spec = this.component(nameOrSlug);
    const title = `${LEVEL_TITLES[spec.level as keyof typeof LEVEL_TITLES]}/${spec.name}`;
    const index = join(config.paths.storybook, 'index.json');
    if (!existsSync(index)) return [];
    const entries = Object.values((readJson(index) as { entries: Record<string, { type: string; id: string; name: string; title: string }> }).entries);
    return entries.filter((e) => e.type === 'story' && e.title === title).map(({ id, name }) => ({ id, name }));
  }

  /** Create or update a component spec. Version is bumped automatically (or by `bump`). */
  saveComponent(spec: Spec, actor: string, opts: { bump?: Bump; summary?: string } = {}) {
    const file = join(config.paths.specs, `${spec.slug}.json`);
    const prev = existsSync(file) ? readJson(file) : null;
    const next: Spec = { $schema: '../schema/component.schema.json', ...spec };
    if (prev) {
      const bump = opts.bump ?? inferBump(prev, next);
      next.version = bumpVersion(prev.version, bump);
    } else {
      next.version ??= '0.1.0';
    }
    const errors = validateSpec(next, file, loadTokens({ srcDir: config.paths.tokensSrc }));
    if (errors.length) throw new HttpError(422, 'Spec is invalid', errors);
    writeJson(file, next);
    const diff = diffJson(prev ?? {}, next).filter((d: DiffEntry) => d.path !== 'version');
    logChange(this.db, {
      entityType: 'component',
      entityId: next.slug,
      action: prev ? 'update' : 'create',
      versionFrom: prev?.version ?? null,
      versionTo: next.version,
      summary: opts.summary,
      diff,
      actor,
    });
    return next;
  }

  // ---------- docs ----------

  docs() {
    return readdirSync(config.paths.docs)
      .filter((f) => f.endsWith('.md'))
      .sort()
      .map((f) => {
        const content = readFileSync(join(config.paths.docs, f), 'utf8');
        const slug = basename(f, '.md');
        return { slug, title: content.match(/^#\s+(.+)$/m)?.[1] ?? slug, summary: content.match(/^>\s*(.+)$/m)?.[1] ?? '' };
      });
  }

  doc(slug: string, format: 'markdown' | 'html' = 'markdown') {
    if (!/^[a-z0-9-]+$/.test(slug)) throw new HttpError(400, 'Invalid doc slug');
    const file = join(config.paths.docs, `${slug}.md`);
    if (!existsSync(file)) throw new HttpError(404, `Doc "${slug}" not found`);
    const content = readFileSync(file, 'utf8');
    const title = content.match(/^#\s+(.+)$/m)?.[1] ?? slug;
    return { slug, title, content: format === 'html' ? (markdown.parse(content) as string) : content, format };
  }

  saveDoc(slug: string, content: string, actor: string, summary?: string) {
    if (!/^[a-z0-9-]+$/.test(slug)) throw new HttpError(400, 'Doc slugs are lowercase letters, numbers and dashes');
    const file = join(config.paths.docs, `${slug}.md`);
    const before = existsSync(file) ? readFileSync(file, 'utf8') : null;
    writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`);
    const diff = before === null ? [{ path: 'content', before: null, after: `${content.length} chars` }] : lineDiff(before, content);
    logChange(this.db, { entityType: 'doc', entityId: slug, action: before === null ? 'create' : 'update', summary, diff, actor });
    return this.doc(slug);
  }

  // ---------- icons ----------

  icons(query?: string) {
    const q = query?.toLowerCase();
    return iconNames
      .map((name) => ({ name, ...icons[name] }))
      .filter((i) => !q || i.name.includes(q) || i.keywords.some((k) => k.includes(q)) || i.category === q)
      .map(({ name, category, keywords, paths }) => ({ name, category, keywords, paths }));
  }

  // ---------- search ----------

  search(query: string, types?: string[]) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const terms = q.split(/\s+/);
    const score = (fields: Array<[string | undefined, number]>) =>
      terms.reduce((sum, term) => sum + fields.reduce((s, [text, w]) => s + (text?.toLowerCase().includes(term) ? w : 0), 0), 0);
    const want = (t: string) => !types?.length || types.includes(t);
    const results: Array<{ type: string; id: string; title: string; snippet: string; score: number; url: string }> = [];

    if (want('component')) {
      for (const c of this.components()) {
        const s = score([
          [c.name, 10],
          [c.slug, 8],
          [c.purpose, 4],
          [c.category, 3],
          [c.level, 3],
          [c.props.map((p: Spec) => p.name).join(' '), 2],
          [c.variants.map((v: Spec) => `${v.name} ${v.useWhen ?? ''}`).join(' '), 2],
          [[...c.usage.do, ...c.usage.dont].join(' '), 1],
        ]);
        if (s) results.push({ type: 'component', id: c.slug, title: c.name, snippet: c.purpose, score: s, url: `/api/components/${c.slug}` });
      }
    }
    if (want('token')) {
      for (const t of this.tokens()) {
        const s = score([
          [t.name, 6],
          [t.description, 2],
        ]);
        if (s) results.push({ type: 'token', id: t.name, title: t.name, snippet: t.description ?? JSON.stringify(t.value), score: s, url: `/api/tokens/${t.name}` });
      }
    }
    if (want('doc')) {
      for (const d of this.docs()) {
        const content = this.doc(d.slug).content;
        const s = score([
          [d.title, 8],
          [content, 1],
        ]);
        if (s) {
          const idx = content.toLowerCase().indexOf(terms[0]);
          const snippet = idx >= 0 ? content.slice(Math.max(0, idx - 60), idx + 120).replace(/\s+/g, ' ').trim() : d.summary;
          results.push({ type: 'doc', id: d.slug, title: d.title, snippet, score: s, url: `/api/docs/${d.slug}` });
        }
      }
    }
    if (want('icon')) {
      for (const i of this.icons()) {
        const s = score([
          [i.name, 5],
          [i.keywords.join(' '), 2],
        ]);
        if (s) results.push({ type: 'icon', id: i.name, title: i.name, snippet: i.keywords.join(', '), score: s, url: `/api/icons?query=${i.name}` });
      }
    }
    return results.sort((a, b) => b.score - a.score).slice(0, 50);
  }

  // ---------- releases ----------

  release(input: { bump?: Bump; version?: string; notes?: string }, actor: string) {
    const manifest = this.manifest();
    const version = input.version ?? bumpVersion(manifest.version, input.bump ?? 'minor');
    if (!/^\d+\.\d+\.\d+$/.test(version)) throw new HttpError(400, 'version must be semver (x.y.z)');
    const pending = listChanges(this.db, { unreleased: true, limit: 500 });
    const snapshot = { manifest: { ...manifest, version }, tokens: this.tokens(), components: this.components() };
    try {
      saveRelease(this.db, version, input.notes ?? '', snapshot, actor);
    } catch {
      throw new HttpError(409, `Release ${version} already exists`);
    }
    markReleased(this.db, version);
    writeJson(config.paths.manifest, { ...manifest, version });
    logChange(this.db, { entityType: 'release', entityId: version, action: 'release', versionFrom: manifest.version, versionTo: version, summary: input.notes, diff: [], actor });

    const lines = pending
      .reverse()
      .map((c) => `- **${c.entityType}** \`${c.entityId}\` ${c.action}${c.versionTo ? ` → ${c.versionTo}` : ''}${c.summary ? ` — ${c.summary}` : ''} _(${c.actor})_`);
    const entry = `## ${version} — ${new Date().toISOString().slice(0, 10)}\n\n${input.notes ? `${input.notes}\n\n` : ''}${lines.join('\n') || '- No tracked changes.'}\n`;
    const existing = existsSync(config.paths.changelog) ? readFileSync(config.paths.changelog, 'utf8') : '# Changelog\n';
    writeFileSync(config.paths.changelog, existing.replace(/^# Changelog\n/, `# Changelog\n\n${entry}`));
    return { version, previous: manifest.version, changes: pending.length };
  }
}

function lineDiff(before: string, after: string): DiffEntry[] {
  const a = before.split('\n');
  const b = after.split('\n');
  const out: DiffEntry[] = [];
  for (let i = 0; i < Math.max(a.length, b.length) && out.length < 100; i++) {
    if (a[i] !== b[i]) out.push({ path: `line ${i + 1}`, before: a[i] ?? null, after: b[i] ?? null });
  }
  return out;
}
