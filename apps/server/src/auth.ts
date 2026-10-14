import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { now, type Db } from './db.js';

export type Role = 'viewer' | 'editor' | 'admin';

/**
 * viewer: read everything (also what anonymous callers get when public read is on).
 * editor: + modify tokens, components, docs.
 * admin:  + cut releases, manage API keys.
 */
const RANK: Record<Role, number> = { viewer: 1, editor: 2, admin: 3 };
export const ROLES = Object.keys(RANK) as Role[];

export interface Principal {
  id: string;
  name: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      principal?: Principal;
    }
  }
}

export const hasRole = (p: Principal | undefined, role: Role) => Boolean(p && RANK[p.role] >= RANK[role]);
const hashKey = (key: string) => createHash('sha256').update(key).digest('hex');

export interface ApiKeyRecord {
  id: string;
  name: string;
  role: Role;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

/** Creates a key. The plaintext is returned once and never stored (only its SHA-256). */
export function createApiKey(db: Db, name: string, role: Role): ApiKeyRecord & { key: string } {
  const key = `ds_${randomBytes(24).toString('base64url')}`;
  const record: ApiKeyRecord = { id: randomUUID(), name, role, prefix: key.slice(0, 10), created_at: now(), last_used_at: null, revoked_at: null };
  db.prepare('INSERT INTO api_keys (id, name, role, key_hash, prefix, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    record.id, name, role, hashKey(key), record.prefix, record.created_at,
  );
  return { ...record, key };
}

export function verifyApiKey(db: Db, key: string): Principal | null {
  const row = db
    .prepare('SELECT id, name, role FROM api_keys WHERE key_hash = ? AND revoked_at IS NULL')
    .get(hashKey(key)) as Principal | undefined;
  if (!row) return null;
  db.prepare('UPDATE api_keys SET last_used_at = ? WHERE id = ?').run(now(), row.id);
  return { id: row.id, name: row.name, role: row.role };
}

export const listApiKeys = (db: Db) =>
  db.prepare('SELECT id, name, role, prefix, created_at, last_used_at, revoked_at FROM api_keys ORDER BY created_at').all() as unknown as ApiKeyRecord[];

export const revokeApiKey = (db: Db, id: string) =>
  db.prepare('UPDATE api_keys SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL').run(now(), id).changes > 0;

export const hasActiveAdmin = (db: Db) =>
  Boolean(db.prepare("SELECT 1 FROM api_keys WHERE role = 'admin' AND revoked_at IS NULL LIMIT 1").get());

const ANONYMOUS: Principal = { id: 'anonymous', name: 'anonymous', role: 'viewer' };

export function extractKey(req: Request): string | undefined {
  const header = req.get('authorization');
  if (header?.toLowerCase().startsWith('bearer ')) return header.slice(7).trim();
  return req.get('x-api-key') ?? undefined;
}

/** Resolves the caller from `Authorization: Bearer <key>` or `X-API-Key`. */
export function authenticate(db: Db, { publicRead }: { publicRead: boolean }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = extractKey(req);
    if (key) {
      const principal = verifyApiKey(db, key);
      if (!principal) return res.status(401).json({ error: 'invalid_api_key', message: 'API key is invalid or revoked.' });
      req.principal = principal;
      return next();
    }
    if (publicRead) {
      req.principal = ANONYMOUS;
      return next();
    }
    res.status(401).json({ error: 'unauthorized', message: 'Send an API key as `Authorization: Bearer <key>`.' });
  };
}

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (hasRole(req.principal, role)) return next();
    res.status(403).json({ error: 'forbidden', message: `Requires the ${role} role.` });
  };
}
