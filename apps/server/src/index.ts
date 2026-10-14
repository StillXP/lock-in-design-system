import { createApp } from './app.js';
import { createApiKey, hasActiveAdmin } from './auth.js';
import { config } from './config.js';
import { openDb } from './db.js';
import { DesignSystemStore } from './store.js';

const db = openDb(config.dataDir);
const store = new DesignSystemStore(db);

// First run: mint an admin key so someone can log in. Shown once.
if (!hasActiveAdmin(db)) {
  const { key } = createApiKey(db, 'bootstrap-admin', 'admin');
  console.log('\n  No admin key found — created one. Save it now; it will not be shown again:\n');
  console.log(`    ${key}\n`);
  console.log('  Manage keys later with: npm run keys -w @lockin/server -- --help\n');
}

createApp(store, db).listen(config.port, config.host, () => {
  const base = `http://${config.host}:${config.port}`;
  console.log(`Lock In hub v${store.manifest().version}`);
  console.log(`  Web UI     ${base}/`);
  console.log(`  REST API   ${base}/api`);
  console.log(`  MCP (HTTP) ${base}/mcp`);
  console.log(`  llms.txt   ${base}/llms.txt`);
  console.log(config.publicRead ? '  Public read on — anyone who can reach this port can browse; edits need an API key.' : '  Public read off (DS_PUBLIC_READ=false) — every request needs an API key.');
});
