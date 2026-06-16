// Data access for defects.
import { db } from '../config/db.js';

const TABLE = 'defects';
const SORTABLE = {
  created_at: 'd.created_at',
  status: 'd.status',
  severity: 'd.severity',
  priority: 'd.priority',
  title: 'd.title',
};

function applyFilters(qb, { projectId, status, severity, priority, assigneeId }, col = '') {
  qb.where(`${col}project_id`, projectId);
  if (status) qb.where(`${col}status`, status);
  if (severity) qb.where(`${col}severity`, severity);
  if (priority) qb.where(`${col}priority`, priority);
  if (assigneeId) qb.where(`${col}assignee_id`, assigneeId);
  return qb;
}

function applySort(qb, sort) {
  let column = 'd.created_at';
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

// Defect rows joined with assignee/reporter names for display.
function withNames(trx, filters) {
  return applyFilters(
    trx(`${TABLE} as d`)
      .leftJoin('users as a', 'a.id', 'd.assignee_id')
      .leftJoin('users as r', 'r.id', 'd.reporter_id'),
    filters,
    'd.',
  ).select(
    'd.*',
    'a.first_name as assignee_first_name',
    'a.last_name as assignee_last_name',
    'r.first_name as reporter_first_name',
    'r.last_name as reporter_last_name',
  );
}

export function findById(id, trx = db) {
  return trx(TABLE).where({ id }).first();
}

export function list(filters, trx = db) {
  return applySort(withNames(trx, filters), filters.sort)
    .limit(filters.limit)
    .offset(filters.offset);
}

export async function count(filters, trx = db) {
  const row = await applyFilters(trx(TABLE), filters).count('* as total').first();
  return Number(row.total);
}

export async function insert(defect, trx = db) {
  const [created] = await trx(TABLE).insert(defect).returning('*');
  return created;
}

export async function insertMany(defects, trx = db) {
  if (!defects.length) return [];
  return trx(TABLE).insert(defects).returning('*');
}

export async function update(id, fields, trx = db) {
  const [updated] = await trx(TABLE).where({ id }).update(fields).returning('*');
  return updated;
}
