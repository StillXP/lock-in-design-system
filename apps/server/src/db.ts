import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('viewer', 'editor', 'admin')),
  key_hash TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_used_at TEXT,
  revoked_at TEXT
);

CREATE TABLE IF NOT EXISTS changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,      -- token | component | doc | release
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,           -- create | update | release
  version_from TEXT,
  version_to TEXT,
  summary TEXT,
  diff TEXT NOT NULL,             -- JSON [{ path, before, after }]
  actor TEXT NOT NULL,
  release TEXT,                   -- set when included in a release
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS changes_entity ON changes (entity_type, entity_id);

CREATE TABLE IF NOT EXISTS releases (
  version TEXT PRIMARY KEY,
  notes TEXT,
  snapshot TEXT NOT NULL,
  actor TEXT NOT NULL,
  created_at TEXT NOT NULL
);

`;

export type Db = DatabaseSync;

export function openDb(dataDir: string, file = 'design-system.db'): Db {
  if (file !== ':memory:') mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(file === ':memory:' ? file : join(dataDir, file));
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec(SCHEMA);
  return db;
}

export const now = () => new Date().toISOString();
