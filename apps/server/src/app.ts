import { existsSync, readFileSync } from 'node:fs';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express, { type NextFunction, type Request, type Response } from 'express';
import { authenticate } from './auth.js';
import { config } from './config.js';
import type { Db } from './db.js';
import { createMcpServer } from './mcp.js';
import { errorHandler, restRouter } from './rest.js';
import type { DesignSystemStore } from './store.js';

export function createApp(store: DesignSystemStore, db: Db, opts: { publicRead?: boolean } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'self'; style-src 'self'; img-src 'self' data:; script-src 'self'; connect-src 'self'; frame-src 'self' https://embed.figma.com https://www.figma.com",
    });
    next();
  });

  const auth = authenticate(db, { publicRead: opts.publicRead ?? config.publicRead });

  app.get('/api/health', (_req, res) => res.json({ ok: true, version: store.manifest().version }));
  app.use('/api', auth, restRouter(store, db));

  // MCP over Streamable HTTP. Stateless: a fresh server per request, scoped to the caller's role.
  app.post('/mcp', auth, async (req, res, next) => {
    try {
      const server = createMcpServer(store, db, req.principal!);
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on('close', () => {
        transport.close();
        server.close();
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      next(err);
    }
  });
  app.all('/mcp', (_req, res) => res.status(405).set('Allow', 'POST').json({ error: 'Use POST (stateless Streamable HTTP).' }));

  // Agent-facing index (public: contains no design system data, only how to connect).
  app.get('/llms.txt', (_req, res) => {
    if (!existsSync(config.paths.llms)) return res.status(404).end();
    res.type('text/plain').send(readFileSync(config.paths.llms, 'utf8'));
  });

  // Architecture diagrams referenced from docs (./diagrams/*.svg|html). They are static,
  // script-free files that use an inline <style> and Google Fonts, so loosen CSP for them only.
  app.use(
    '/diagrams',
    (_req: Request, res: Response, next: NextFunction) => {
      res.set(
        'Content-Security-Policy',
        "default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:",
      );
      next();
    },
    express.static(`${config.paths.docs}/diagrams`),
  );

  // Static Storybook build, embedded by component pages as live examples. Storybook's preview needs
  // inline scripts and styles, so it gets its own CSP and may be framed, but only by the hub itself.
  app.use(
    '/storybook',
    (_req: Request, res: Response, next: NextFunction) => {
      res.set({
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy':
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-src 'self'; frame-ancestors 'self'",
      });
      next();
    },
    express.static(config.paths.storybook),
  );

  // Web UI dogfoods the system's own CSS.
  app.use('/assets/tokens', express.static(`${config.paths.tokensDist}/css`));
  // The token sheets reference their web fonts as ../fonts/<file> (and ../../fonts/ from themes/).
  app.use('/assets/fonts', express.static(`${config.paths.tokensDist}/fonts`, { index: false }));
  app.use('/assets/react', express.static(config.paths.reactDist, { index: false }));
  app.use(express.static(config.paths.public));

  app.use(errorHandler);
  return app;
}
