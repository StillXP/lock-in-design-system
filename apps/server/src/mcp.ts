import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { hasRole, type Principal } from './auth.js';
import type { Db } from './db.js';
import { listChanges, listReleases } from './history.js';
import { HttpError, type DesignSystemStore } from './store.js';

const json = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });

/** Run a tool body, turning store errors into MCP tool errors the agent can read. */
async function run(fn: () => unknown) {
  try {
    return json(await fn());
  } catch (err) {
    const message = err instanceof HttpError ? `${err.message}${err.details ? `\n${JSON.stringify(err.details, null, 2)}` : ''}` : String(err);
    return { content: [{ type: 'text' as const, text: message }], isError: true };
  }
}

const INSTRUCTIONS = `Lock In is a cross-platform design system (React for web, React Native for mobile).
Workflow for building UI:
1. search_design_system or list_components to find the right component.
2. get_component for its full spec: props, states, tokens, accessibility rules, do/don't and examples. Follow the spec exactly.
3. Style custom UI only with semantic tokens (get_tokens prefix "color.text", "color.background", "space", "typography"...). Never hard-code hex values or use base palette tokens (color.blue.600) directly.
4. Verify any new color pairing with check_contrast (WCAG AA: 4.5:1 text, 3:1 UI).`;

export function createMcpServer(store: DesignSystemStore, db: Db, principal: Principal) {
  const server = new McpServer(
    { name: 'lockin-design-system', version: store.manifest().version },
    { instructions: INSTRUCTIONS },
  );
  const readOnly = { readOnlyHint: true, openWorldHint: false };

  // ---------- read tools ----------

  server.registerTool(
    'search_design_system',
    {
      title: 'Search the design system',
      description: 'Full-text search across components, tokens, docs and icons. Start here when unsure what exists.',
      inputSchema: {
        query: z.string().describe('Words to search for, e.g. "confirm delete", "error text color", "table"'),
        types: z.array(z.enum(['component', 'token', 'doc', 'icon'])).optional().describe('Limit to these result types'),
      },
      annotations: readOnly,
    },
    ({ query, types }) => run(() => store.search(query, types)),
  );

  server.registerTool(
    'list_components',
    {
      title: 'List components',
      description: 'All components with status, version, category, purpose and import statements.',
      annotations: readOnly,
    },
    () => run(() => store.components().map(({ name, slug, status, version, category, purpose, import: imp }) => ({ name, slug, status, version, category, purpose, import: imp }))),
  );

  server.registerTool(
    'get_component',
    {
      title: 'Get component spec',
      description: 'Full machine-readable spec for one component: import, props, states, tokens, accessibility (roles, keyboard, screen reader, WCAG), variants, and usage (do, dont, related, example for web and native).',
      inputSchema: { name: z.string().describe('Component name or slug, e.g. "Button", "data-table"') },
      annotations: readOnly,
    },
    ({ name }) => run(() => store.component(name)),
  );

  server.registerTool(
    'get_tokens',
    {
      title: 'Get design tokens',
      description: 'Resolved design tokens with CSS variable names, light/dark values and alias chain. Filter by prefix (e.g. "color.text", "space", "typography.heading").',
      inputSchema: {
        prefix: z.string().optional().describe('Token path prefix'),
        type: z.string().optional().describe('Token type: color, dimension, typography, shadow, fontWeight, duration…'),
        layer: z.enum(['base', 'semantic']).optional().describe('base = raw palette, semantic = what UI should use'),
        theme: z.string().optional().describe('Project theme name (see list via get_tokens on "color.brand")'),
      },
      annotations: readOnly,
    },
    ({ prefix, type, layer, theme }) =>
      run(() => store.tokens(theme).filter((t) => (!prefix || t.name.startsWith(prefix)) && (!type || t.type === type) && (!layer || t.layer === layer))),
  );

  server.registerTool(
    'get_token',
    {
      title: 'Get one token',
      description: 'Details for a single token including source value, file, and which components use it.',
      inputSchema: { name: z.string().describe('Token path, e.g. "color.text.primary"'), theme: z.string().optional() },
      annotations: readOnly,
    },
    ({ name, theme }) => run(() => store.token(name, theme)),
  );

  server.registerTool(
    'check_contrast',
    {
      title: 'Check color contrast',
      description: 'WCAG 2.1 contrast ratio between two colors. Accepts token names (resolved for the given mode/theme) or hex values.',
      inputSchema: {
        foreground: z.string().describe('Token name or hex, e.g. "color.text.secondary" or "#4B5260"'),
        background: z.string().describe('Token name or hex'),
        mode: z.enum(['light', 'dark']).default('light'),
        theme: z.string().optional(),
      },
      annotations: readOnly,
    },
    ({ foreground, background, mode, theme }) => run(() => store.contrast(foreground, background, mode, theme)),
  );

  server.registerTool(
    'list_icons',
    {
      title: 'List icons',
      description: 'Icon names available to the Icon component (and iconStart/iconEnd props), with keywords.',
      inputSchema: { query: z.string().optional().describe('Filter by name, keyword or category') },
      annotations: readOnly,
    },
    ({ query }) => run(() => store.icons(query)),
  );

  server.registerTool(
    'list_docs',
    { title: 'List docs', description: 'Usage guides: getting started, tokens, theming, accessibility, contributing, API.', annotations: readOnly },
    () => run(() => store.docs()),
  );

  server.registerTool(
    'get_doc',
    {
      title: 'Read a doc',
      description: 'Markdown content of a documentation page.',
      inputSchema: { slug: z.string().describe('Doc slug from list_docs, e.g. "accessibility"') },
      annotations: readOnly,
    },
    ({ slug }) => run(() => store.doc(slug)),
  );

  server.registerTool(
    'get_changelog',
    {
      title: 'Get change history',
      description: 'Tracked changes (newest first) and releases. Filter by entity to see a component or token history.',
      inputSchema: {
        entityType: z.enum(['token', 'component', 'doc', 'release']).optional(),
        entityId: z.string().optional(),
        unreleased: z.boolean().optional().describe('Only changes not yet in a release'),
        limit: z.number().int().min(1).max(200).default(30),
      },
      annotations: readOnly,
    },
    (args) => run(() => ({ releases: listReleases(db), changes: listChanges(db, args) })),
  );

  // ---------- write tools (editor+) ----------

  if (hasRole(principal, 'editor')) {
    const write = { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false };

    server.registerTool(
      'update_component',
      {
        title: 'Create or update a component spec',
        description: 'Writes a full component spec (same shape as get_component). Validated against the schema; referenced tokens must exist. The version is bumped automatically (major for breaking prop changes, minor for additions, patch otherwise) unless bump is given. The change is logged.',
        inputSchema: {
          spec: z.record(z.string(), z.unknown()).describe('Complete component spec object'),
          bump: z.enum(['major', 'minor', 'patch']).optional(),
          summary: z.string().describe('One-line reason for the change'),
        },
        annotations: write,
      },
      ({ spec, bump, summary }) => run(() => store.saveComponent(spec, `${principal.name} (mcp)`, { bump, summary })),
    );

    server.registerTool(
      'update_token',
      {
        title: 'Create or update a token',
        description: 'Sets a token value. Semantic colors take { "light": "{color.x.y}", "dark": "{color.x.y}" } referencing base tokens. Rejected if any WCAG contrast pair would fail. Outputs are rebuilt and the change is logged.',
        inputSchema: {
          name: z.string().describe('Token path'),
          value: z.unknown().describe('New $value'),
          type: z.string().optional().describe('Required when creating'),
          description: z.string().optional(),
          layer: z.enum(['base', 'semantic']).optional(),
          summary: z.string().describe('One-line reason'),
        },
        annotations: write,
      },
      ({ name, summary, ...input }) => run(() => store.saveToken(name, input, `${principal.name} (mcp)`, summary)),
    );

    server.registerTool(
      'update_doc',
      {
        title: 'Create or update a doc',
        description: 'Writes a markdown documentation page. The change is logged.',
        inputSchema: { slug: z.string(), content: z.string().describe('Full markdown content'), summary: z.string() },
        annotations: write,
      },
      ({ slug, content, summary }) => run(() => store.saveDoc(slug, content, `${principal.name} (mcp)`, summary)),
    );
  }

  // ---------- resources ----------

  server.registerResource(
    'overview',
    'ds://overview',
    { title: 'Design system overview', mimeType: 'application/json' },
    (uri) => ({ contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(store.overview(), null, 2) }] }),
  );

  server.registerResource(
    'tokens',
    new ResourceTemplate('ds://tokens/{mode}', {
      list: () => ({ resources: ['light', 'dark'].map((m) => ({ uri: `ds://tokens/${m}`, name: `Tokens (${m})`, mimeType: 'application/json' })) }),
    }),
    { title: 'Resolved tokens by color mode', mimeType: 'application/json' },
    (uri, { mode }) => {
      const m = mode === 'dark' ? 'dark' : 'light';
      const values = store.tokens().map((t) => ({
        name: t.name,
        cssVar: t.cssVar,
        value: t.value && typeof t.value === 'object' && 'light' in (t.value as object) ? (t.value as Record<string, unknown>)[m] : t.value,
      }));
      return { contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(values, null, 2) }] };
    },
  );

  server.registerResource(
    'component',
    new ResourceTemplate('ds://components/{slug}', {
      list: () => ({ resources: store.components().map((c) => ({ uri: `ds://components/${c.slug}`, name: c.name, description: c.purpose, mimeType: 'application/json' })) }),
    }),
    { title: 'Component spec', mimeType: 'application/json' },
    (uri, { slug }) => ({ contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(store.component(String(slug)), null, 2) }] }),
  );

  server.registerResource(
    'doc',
    new ResourceTemplate('ds://docs/{slug}', {
      list: () => ({ resources: store.docs().map((d) => ({ uri: `ds://docs/${d.slug}`, name: d.title, mimeType: 'text/markdown' })) }),
    }),
    { title: 'Documentation page', mimeType: 'text/markdown' },
    (uri, { slug }) => ({ contents: [{ uri: uri.href, mimeType: 'text/markdown', text: store.doc(String(slug)).content }] }),
  );

  // ---------- prompts ----------

  server.registerPrompt(
    'build_with_lockin',
    {
      title: 'Build UI with Lock In',
      description: 'Primes the assistant to build a screen using Lock In components and tokens.',
      argsSchema: {
        task: z.string().describe('What to build, e.g. "tournament standings page"'),
        platform: z.enum(['web', 'native']).optional().describe('web (React) or native (React Native)'),
      },
    },
    ({ task, platform }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Build: ${task}\nPlatform: ${platform ?? 'web'} (${platform === 'native' ? '@lockin/react-native' : '@lockin/react'})\n\n${INSTRUCTIONS}\n\nAvailable components:\n${store
              .components()
              .map((c) => `- ${c.name}: ${c.purpose}`)
              .join('\n')}\n\nMeet WCAG 2.1 AA: label every control, keep focus visible, don't convey meaning by color alone, support keyboard and screen readers.`,
          },
        },
      ],
    }),
  );

  return server;
}
