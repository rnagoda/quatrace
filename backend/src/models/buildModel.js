// Data access for builds.
import { db } from '../config/db.js';

const TABLE = 'builds';

export async function insertMany(rows, trx = db) {
  if (!rows.length) return [];
  return trx(TABLE).insert(rows).returning('*');
}

export function listByProject(projectId, trx = db) {
  return trx(TABLE).where({ project_id: projectId }).orderBy('created_at', 'desc');
}

export function findById(id, trx = db) {
  return trx(TABLE).where({ id }).first();
}
