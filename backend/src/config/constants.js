// Shared constants. Error codes are stable strings that tests assert against
// (they appear in the `error.code` field of the response envelope).
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

// Cost factor for bcrypt password hashing.
export const BCRYPT_ROUNDS = 10;

// Name of the httpOnly cookie carrying the refresh token.
export const REFRESH_COOKIE_NAME = 'refresh_token';

// Path the refresh cookie is scoped to (covers /refresh and /logout).
export const REFRESH_COOKIE_PATH = '/api/auth';
