import { now, type Db } from './db.js';

export type EntityType = 'token' | 'component' | 'doc' | 'release';

export interface DiffEntry {
  path: string;
  before: unknown;
  after: unknown;
}

export interface ChangeRecord {
  id: number;
  entityType: EntityType;
  entityId: string;
  action: 'create' | 'update' | 'release';
  versionFrom: string | null;
  versionTo: string | null;
  summary: string | null;
  diff: DiffEntry[];
  actor: string;
  release: string | null;
  createdAt: string;
}

/** Structural diff of two JSON values: one entry per changed leaf (capped). */
export function diffJson(before: unknown, after: unknown, path = '', out: DiffEntry[] = [], limit = 200): DiffEntry[] {
  if (out.length >= limit) return out;
  const isObj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object';
  if (isObj(before) && isObj(after) && Array.isArray(before) === Array.isArray(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    for (const k of keys) diffJson(before[k], after[k], path ? `${path}.${k}` : k, out, limit);
    return out;
  }
  if (JSON.stringify(before) !== JSON.stringify(after)) out.push({ path: path || '(root)', before, after });
  return out;
}

export function logChange(
  db: Db,
  c: { entityType: EntityType; entityId: string; action: ChangeRecord['action']; versionFrom?: string | null; versionTo?: string | null; summary?: string; diff: DiffEntry[]; actor: string },
): number {
  const result = db
    .prepare(
      'INSERT INTO changes (entity_type, entity_id, action, version_from, version_to, summary, diff, actor, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .run(c.entityType, c.entityId, c.action, c.versionFrom ?? null, c.versionTo ?? null, c.summary ?? null, JSON.stringify(c.diff), c.actor, now());
  return Number(result.lastInsertRowid);
}

const mapChange = (r: Record<string, unknown>): ChangeRecord => ({
  id: r.id as number,
  entityType: r.entity_type as EntityType,
  entityId: r.entity_id as string,
  action: r.action as ChangeRecord['action'],
  versionFrom: r.version_from as string | null,
  versionTo: r.version_to as string | null,
  summary: r.summary as string | null,
  diff: JSON.parse(r.diff as string),
  actor: r.actor as string,
  release: r.release as string | null,
  createdAt: r.created_at as string,
});

export function listChanges(
  db: Db,
  { entityType, entityId, unreleased, limit = 50 }: { entityType?: string; entityId?: string; unreleased?: boolean; limit?: number } = {},
): ChangeRecord[] {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (entityType) (where.push('entity_type = ?'), params.push(entityType));
  if (entityId) (where.push('entity_id = ?'), params.push(entityId));
  if (unreleased) where.push("release IS NULL AND action != 'release'");
  params.push(Math.min(limit, 500));
  const sql = `SELECT * FROM changes ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY id DESC LIMIT ?`;
  return (db.prepare(sql).all(...params) as Record<string, unknown>[]).map(mapChange);
}

export function markReleased(db: Db, version: string) {
  db.prepare("UPDATE changes SET release = ? WHERE release IS NULL AND action != 'release'").run(version);
}

export function saveRelease(db: Db, version: string, notes: string, snapshot: unknown, actor: string) {
  db.prepare('INSERT INTO releases (version, notes, snapshot, actor, created_at) VALUES (?, ?, ?, ?, ?)').run(
    version, notes, JSON.stringify(snapshot), actor, now(),
  );
}

export const listReleases = (db: Db) =>
  db.prepare('SELECT version, notes, actor, created_at AS createdAt FROM releases ORDER BY created_at DESC').all();

export function getRelease(db: Db, version: string) {
  const row = db.prepare('SELECT * FROM releases WHERE version = ?').get(version) as Record<string, string> | undefined;
  return row && { version: row.version, notes: row.notes, actor: row.actor, createdAt: row.created_at, snapshot: JSON.parse(row.snapshot) };
}
