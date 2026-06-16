// Data access for defect comments.
import { db } from '../config/db.js';

const TABLE = 'defect_comments';

export function listByDefect(defectId, trx = db) {
  return trx(`${TABLE} as c`)
    .leftJoin('users as u', 'u.id', 'c.author_id')
    .where('c.defect_id', defectId)
    .orderBy('c.created_at', 'asc')
    .select(
      'c.id',
      'c.defect_id',
      'c.parent_comment_id',
      'c.body',
      'c.author_id',
      'c.created_at',
      'u.first_name as author_first_name',
      'u.last_name as author_last_name',
    );
}

export function findById(id, trx = db) {
  return trx(TABLE).where({ id }).first();
}

export async function insert({ defectId, authorId, body, parentCommentId = null }, trx = db) {
  const [created] = await trx(TABLE)
    .insert({
      defect_id: defectId,
      author_id: authorId,
      body,
      parent_comment_id: parentCommentId,
    })
    .returning('*');
  return created;
}
