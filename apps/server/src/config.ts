import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Role } from './auth.js';

const here = dirname(fileURLToPath(import.meta.url));
/** Content root. Override with DS_REPO_ROOT (tests use an isolated copy). */
export const REPO_ROOT = process.env.DS_REPO_ROOT ?? resolve(here, '../../..');

export const config = {
  port: Number(process.env.PORT ?? 4400),
  host: process.env.HOST ?? '127.0.0.1',
  dataDir: process.env.DS_DATA_DIR ?? join(here, '..', 'data'),
  /** Allow unauthenticated read access (viewer role) to REST, MCP and the web UI. On unless DS_PUBLIC_READ=false. */
  publicRead: process.env.DS_PUBLIC_READ !== 'false',
  /** Role granted to the local stdio MCP server (it runs as you, on your machine). */
  stdioRole: (process.env.DS_STDIO_ROLE ?? 'editor') as Role,
  paths: {
    tokensSrc: join(REPO_ROOT, 'packages', 'tokens', 'src'),
    tokensDist: join(REPO_ROOT, 'packages', 'tokens', 'dist'),
    reactDist: join(REPO_ROOT, 'packages', 'react', 'dist'),
    /** Static Storybook build (`npm run build:storybook`); component pages embed its stories as live examples. */
    storybook: join(REPO_ROOT, 'apps', 'storybook', 'storybook-static'),
    specs: join(REPO_ROOT, 'packages', 'specs', 'components'),
    specSchema: join(REPO_ROOT, 'packages', 'specs', 'schema', 'component.schema.json'),
    docs: join(REPO_ROOT, 'docs'),
    manifest: join(REPO_ROOT, 'design-system.json'),
    changelog: join(REPO_ROOT, 'CHANGELOG.md'),
    llms: join(REPO_ROOT, 'llms.txt'),
    public: join(here, '..', 'public'),
  },
};
