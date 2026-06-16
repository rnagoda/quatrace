// Data access for refresh tokens. Only token hashes are stored.
import { db } from '../config/db.js';

const TABLE = 'refresh_tokens';

export async function insertRefreshToken({ userId, tokenHash, expiresAt }, trx = db) {
  const [created] = await trx(TABLE)
    .insert({ user_id: userId, token_hash: tokenHash, expires_at: expiresAt })
    .returning('*');
  return created;
}

// An active token is one that is neither revoked nor expired.
export function findActiveByHash(tokenHash, trx = db) {
  return trx(TABLE)
    .where({ token_hash: tokenHash })
    .whereNull('revoked_at')
    .where('expires_at', '>', trx.fn.now())
    .first();
}

export function revokeById(id, trx = db) {
  return trx(TABLE).where({ id }).update({ revoked_at: trx.fn.now() });
}

export function revokeAllForUser(userId, trx = db) {
  return trx(TABLE)
    .where({ user_id: userId })
    .whereNull('revoked_at')
    .update({ revoked_at: trx.fn.now() });
}
