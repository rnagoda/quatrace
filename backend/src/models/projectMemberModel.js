// Data access for project membership.
import { db } from '../config/db.js';

const TABLE = 'project_members';

// Members of a project, joined with their user profile.
export function listByProject(projectId, trx = db) {
  return trx(`${TABLE} as pm`)
    .join('users as u', 'u.id', 'pm.user_id')
    .where('pm.project_id', projectId)
    .orderBy('pm.created_at', 'asc')
    .select(
      'pm.user_id',
      'pm.is_active_project',
      'u.first_name',
      'u.last_name',
      'u.email',
      'u.role',
    );
}

export function findMembership(projectId, userId, trx = db) {
  return trx(TABLE).where({ project_id: projectId, user_id: userId }).first();
}

export async function insert({ projectId, userId, isActiveProject = false }, trx = db) {
  const [created] = await trx(TABLE)
    .insert({ project_id: projectId, user_id: userId, is_active_project: isActiveProject })
    .returning('*');
  return created;
}

export function remove(projectId, userId, trx = db) {
  return trx(TABLE).where({ project_id: projectId, user_id: userId }).del();
}
