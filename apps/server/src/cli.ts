// API key management:  npm run keys -w @lockin/server -- <command>
//   list
//   create --name <name> --role <viewer|editor|admin>
//   revoke --id <id>
import { parseArgs } from 'node:util';
import { createApiKey, listApiKeys, revokeApiKey, ROLES, type Role } from './auth.js';
import { config } from './config.js';
import { openDb } from './db.js';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { name: { type: 'string' }, role: { type: 'string', default: 'viewer' }, id: { type: 'string' }, help: { type: 'boolean' } },
});
const db = openDb(config.dataDir);
const [command] = positionals;

if (command === 'list') {
  console.table(listApiKeys(db));
} else if (command === 'create') {
  if (!values.name || !ROLES.includes(values.role as Role)) {
    console.error(`Usage: create --name <name> --role <${ROLES.join('|')}>`);
    process.exit(1);
  }
  const { key, ...rest } = createApiKey(db, values.name, values.role as Role);
  console.table([rest]);
  console.log(`\nKey (shown once): ${key}\n`);
} else if (command === 'revoke' && values.id) {
  console.log(revokeApiKey(db, values.id) ? 'Revoked.' : 'No active key with that id.');
} else {
  console.log('Commands: list | create --name <name> --role <viewer|editor|admin> | revoke --id <id>');
}
