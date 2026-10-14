import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { createApiKey, listApiKeys, requireRole, revokeApiKey, ROLES } from './auth.js';
import type { Db } from './db.js';
import { getRelease, listChanges, listReleases } from './history.js';
import { HttpError, type DesignSystemStore } from './store.js';

const Bump = z.enum(['major', 'minor', 'patch']);
const actorOf = (req: Request) => req.principal?.name ?? 'unknown';
const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);

/** Wraps handlers so thrown errors (sync or async) reach the error middleware. */
const h =
  (fn: (req: Request, res: Response) => unknown) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const out = fn(req, res);
      if (out instanceof Promise) out.catch(next);
    } catch (err) {
      next(err);
    }
  };

export function restRouter(store: DesignSystemStore, db: Db): Router {
  const r = Router();
  const viewer = requireRole('viewer');
  const editor = requireRole('editor');
  const admin = requireRole('admin');

  r.get('/', (_req, res) =>
    res.json({
      name: 'Lock In Design System API',
      docs: '/api/docs/mcp-server',
      endpoints: [
        'GET  /api/overview',
        'GET  /api/me',
        'GET  /api/search?q=&types=component,token,doc,icon',
        'GET  /api/tokens?theme=&prefix=&type=',
        'GET  /api/tokens/:name',
        'PUT  /api/tokens/:name            (editor)',
        'GET  /api/themes',
        'GET  /api/contrast?fg=&bg=&mode=&theme=',
        'GET  /api/components',
        'GET  /api/components/:name',
        'PUT  /api/components/:name        (editor)',
        'GET  /api/components/:name/history',
        'GET  /api/components/:name/stories',
        'GET  /api/icons?query=',
        'GET  /api/docs',
        'GET  /api/docs/:slug?format=markdown|html',
        'PUT  /api/docs/:slug              (editor)',
        'GET  /api/changes?entityType=&entityId=&unreleased=true&limit=',
        'GET  /api/releases',
        'GET  /api/releases/:version',
        'POST /api/releases                (admin)',
        'GET  /api/keys                    (admin)',
        'POST /api/keys                    (admin)',
        'DELETE /api/keys/:id              (admin)',
        'POST /mcp                         (MCP Streamable HTTP)',
      ],
    }),
  );

  r.get('/overview', viewer, h((_req, res) => res.json(store.overview())));
  r.get('/me', viewer, (req, res) => res.json(req.principal));

  r.get(
    '/search',
    viewer,
    h((req, res) => {
      const types = str(req.query.types)?.split(',');
      res.json({ query: req.query.q ?? '', results: store.search(String(req.query.q ?? ''), types) });
    }),
  );

  // ----- tokens -----
  r.get(
    '/tokens',
    viewer,
    h((req, res) => {
      const prefix = str(req.query.prefix);
      const type = str(req.query.type);
      const tokens = store
        .tokens(str(req.query.theme))
        .filter((t) => (!prefix || t.name.startsWith(prefix)) && (!type || t.type === type));
      res.json({ count: tokens.length, tokens });
    }),
  );
  r.get('/tokens/:name', viewer, h((req, res) => res.json(store.token(String(req.params.name), str(req.query.theme)))));
  r.put(
    '/tokens/:name',
    editor,
    h((req, res) => {
      const body = z
        .object({
          value: z.unknown().refine((v) => v !== undefined, 'value is required'),
          type: z.string().optional(),
          description: z.string().optional(),
          layer: z.enum(['base', 'semantic']).optional(),
          summary: z.string().max(500).optional(),
        })
        .parse(req.body);
      res.json(store.saveToken(String(req.params.name), body, actorOf(req), body.summary));
    }),
  );
  r.get('/themes', viewer, h((_req, res) => res.json(store.themes())));
  r.get(
    '/contrast',
    viewer,
    h((req, res) => {
      const q = z.object({ fg: z.string(), bg: z.string(), mode: z.enum(['light', 'dark']).default('light'), theme: z.string().optional() }).parse(req.query);
      res.json(store.contrast(q.fg, q.bg, q.mode, q.theme));
    }),
  );

  // ----- components -----
  r.get(
    '/components',
    viewer,
    h((req, res) => {
      const list = store.components();
      if (req.query.full === 'true') return res.json(list);
      res.json(list.map(({ name, slug, status, version, category, purpose, import: imp }) => ({ name, slug, status, version, category, purpose, import: imp })));
    }),
  );
  r.get('/components/:name', viewer, h((req, res) => res.json(store.component(String(req.params.name)))));
  r.put(
    '/components/:name',
    editor,
    h((req, res) => {
      const { spec, bump, summary } = z.object({ spec: z.record(z.string(), z.unknown()), bump: Bump.optional(), summary: z.string().max(500).optional() }).parse(req.body);
      if (spec.slug !== req.params.name) throw new HttpError(400, 'spec.slug must match the URL');
      res.json(store.saveComponent(spec, actorOf(req), { bump, summary }));
    }),
  );
  r.get(
    '/components/:name/history',
    viewer,
    h((req, res) => {
      const slug = store.component(String(req.params.name)).slug;
      res.json(listChanges(db, { entityType: 'component', entityId: slug }));
    }),
  );

  r.get('/components/:name/stories', viewer, h((req, res) => res.json(store.componentStories(String(req.params.name)))));

  r.get('/icons', viewer, h((req, res) => res.json(store.icons(str(req.query.query)))));

  // ----- docs -----
  r.get('/docs', viewer, h((_req, res) => res.json(store.docs())));
  r.get('/docs/:slug', viewer, h((req, res) => res.json(store.doc(String(req.params.slug), req.query.format === 'html' ? 'html' : 'markdown'))));
  r.put(
    '/docs/:slug',
    editor,
    h((req, res) => {
      const { content, summary } = z.object({ content: z.string().min(1).max(500_000), summary: z.string().max(500).optional() }).parse(req.body);
      res.json(store.saveDoc(String(req.params.slug), content, actorOf(req), summary));
    }),
  );

  // ----- versioning -----
  r.get(
    '/changes',
    viewer,
    h((req, res) =>
      res.json(
        listChanges(db, {
          entityType: str(req.query.entityType),
          entityId: str(req.query.entityId),
          unreleased: req.query.unreleased === 'true',
          limit: Number(req.query.limit ?? 50),
        }),
      ),
    ),
  );
  r.get('/releases', viewer, (_req, res) => res.json(listReleases(db)));
  r.get(
    '/releases/:version',
    viewer,
    h((req, res) => {
      const rel = getRelease(db, String(req.params.version));
      if (!rel) throw new HttpError(404, 'Release not found');
      res.json(rel);
    }),
  );
  r.post(
    '/releases',
    admin,
    h((req, res) => {
      const body = z.object({ bump: Bump.optional(), version: z.string().optional(), notes: z.string().max(5000).optional() }).parse(req.body ?? {});
      res.status(201).json(store.release(body, actorOf(req)));
    }),
  );

  // ----- API keys -----
  r.get('/keys', admin, (_req, res) => res.json(listApiKeys(db)));
  r.post(
    '/keys',
    admin,
    h((req, res) => {
      const { name, role } = z.object({ name: z.string().trim().min(1).max(100), role: z.enum(ROLES as [string, ...string[]]) }).parse(req.body);
      const created = createApiKey(db, name, role as (typeof ROLES)[number]);
      res.status(201).json({ ...created, warning: 'Store this key now — it cannot be shown again.' });
    }),
  );
  r.delete(
    '/keys/:id',
    admin,
    h((req, res) => {
      if (!revokeApiKey(db, String(req.params.id))) throw new HttpError(404, 'Key not found or already revoked');
      res.status(204).end();
    }),
  );

  return r;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof z.ZodError) return res.status(400).json({ error: 'validation_error', issues: err.issues });
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, details: err.details });
  if (err instanceof SyntaxError) return res.status(400).json({ error: 'invalid_json' });
  console.error(err);
  res.status(500).json({ error: 'internal_error' });
}
