// Data access for organizations.
import { db } from '../config/db.js';

const TABLE = 'organizations';

export async function insertOrganization(org, trx = db) {
  const [created] = await trx(TABLE).insert(org).returning('*');
  return created;
}
