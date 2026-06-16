// Authentication middleware. Reads the Bearer access token, verifies it, and
// attaches a minimal req.user. Returns 401 when missing or invalid.
import { verifyAccessToken } from '../utils/tokens.js';
import { AppError } from '../utils/AppError.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw AppError.unauthorized('Missing or malformed Authorization header.');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw AppError.unauthorized('Invalid or expired access token.');
  }

  req.user = { id: payload.sub, role: payload.role, organizationId: payload.org };
  next();
}
