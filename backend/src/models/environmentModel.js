// Data access for environments.
import { db } from '../config/db.js';

const TABLE = 'environments';

export async function insertMany(rows, trx = db) {
  if (!rows.length) return [];
  return trx(TABLE).insert(rows).returning('*');
}

export function listByProject(projectId, trx = db) {
  return trx(TABLE).where({ project_id: projectId }).orderBy('created_at', 'asc');
}
