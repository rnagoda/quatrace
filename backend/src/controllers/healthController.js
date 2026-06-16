// Thin controller: call the service, wrap the result in the response envelope.
// On DB failure, surface a 503 via a typed AppError handled by the middleware.
import { getReadiness } from '../services/healthService.js';
import { AppError } from '../utils/AppError.js';
import { ok } from '../utils/response.js';

export async function getHealth(req, res) {
  try {
    const health = await getReadiness();
    res.status(200).json(ok(health));
  } catch {
    throw AppError.serviceUnavailable('Database is not reachable.');
  }
}
