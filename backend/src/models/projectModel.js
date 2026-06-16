// Data access for projects. All queries are organization-scoped by the caller.
import { db } from '../config/db.js';

const TABLE = 'projects';

// Columns clients may sort by, mapped to their physical column.
const SORTABLE = { name: 'name', created_at: 'created_at' };

function applyFilters(qb, { orgId, status }) {
  qb.where({ organization_id: orgId });
  if (status) qb.where({ status });
  return qb;
}

function applySort(qb, sort) {
  let column = 'created_at';
  let direction = 'desc';
  if (sort) {
    const desc = sort.startsWith('-');
    const key = desc ? sort.slice(1) : sort;
    if (SORTABLE[key]) {
      column = SORTABLE[key];
      direction = desc ? 'desc' : 'asc';
    }
  }
  return qb.orderBy(column, direction);
}

export function findById(id, trx = db) {
  return trx(TABLE).where({ id }).first();
}

export function list({ orgId, status, sort, limit, offset }, trx = db) {
  const qb = applyFilters(trx(TABLE), { orgId, status });
  return applySort(qb, sort).limit(limit).offset(offset);
}

export async function count({ orgId, status }, trx = db) {
  const row = await applyFilters(trx(TABLE), { orgId, status }).count('* as total').first();
  return Number(row.total);
}

export async function insert(project, trx = db) {
  const [created] = await trx(TABLE).insert(project).returning('*');
  return created;
}

export async function update(id, fields, trx = db) {
  const [updated] = await trx(TABLE).where({ id }).update(fields).returning('*');
  return updated;
}
