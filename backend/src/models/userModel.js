// Data access for users. All queries go through the shared Knex instance.
import { db } from '../config/db.js';

const TABLE = 'users';

// Columns safe to return to clients (never the password hash).
export const PUBLIC_USER_COLUMNS = [
  'id',
  'organization_id',
  'email',
  'first_name',
  'last_name',
  'role',
  'is_npc',
  'npc_persona',
  'avatar_url',
  'onboarded_at',
  'created_at',
  'updated_at',
];

export function markOnboarded(id, trx = db) {
  return trx('users').where({ id }).update({ onboarded_at: trx.fn.now() });
}

export function findByEmail(email, trx = db) {
  return trx(TABLE).whereRaw('lower(email) = lower(?)', [email]).first();
}

export function findById(id, trx = db) {
  return trx(TABLE).where({ id }).first(PUBLIC_USER_COLUMNS);
}

export async function insertUser(user, trx = db) {
  const [created] = await trx(TABLE).insert(user).returning(PUBLIC_USER_COLUMNS);
  return created;
}
