// Global error middleware. Catches everything thrown in the app and returns the
// consistent error envelope. Known AppErrors map to their status/code; anything
// else becomes a generic 500 so internal details never leak to the client.
import { ERROR_CODES } from '../config/constants.js';
import { AppError } from '../utils/AppError.js';
import { fail } from '../utils/response.js';
import { logger } from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity (4 args).
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    res.status(err.status).json(fail(err.code, err.message, err.details));
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res
    .status(500)
    .json(fail(ERROR_CODES.INTERNAL_ERROR, 'An unexpected error occurred.'));
}

// 404 fallback for unmatched routes.
export function notFoundHandler(req, res) {
  res
    .status(404)
    .json(fail(ERROR_CODES.NOT_FOUND, `Route not found: ${req.method} ${req.path}`));
}
