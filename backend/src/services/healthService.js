// Health business logic. Liveness is implicit (the process answered). Readiness
// verifies the database is reachable with a trivial query.
import { db } from '../config/db.js';

/**
 * @returns {Promise<{ status: string, db: string, uptime: number, timestamp: string }>}
 * @throws {AppError} 503 when the database is unreachable.
 */
export async function getReadiness() {
  await db.raw('SELECT 1');
  return {
    status: 'ok',
    db: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}
