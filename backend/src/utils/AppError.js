// Typed application error. Services throw these; the global error middleware
// translates them into the error envelope with the right HTTP status. Keeping a
// single error type lets every caller and the middleware handle failures uniformly.
import { ERROR_CODES } from '../config/constants.js';

export class AppError extends Error {
  /**
   * @param {number} status   HTTP status code
   * @param {string} code     stable error code (ERROR_CODES)
   * @param {string} message  human-readable message
   * @param {Array}  details  optional field-level details
   */
  constructor(status, code, message, details = []) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details = []) {
    return new AppError(400, ERROR_CODES.VALIDATION_ERROR, message, details);
  }

  static unauthorized(message = 'Authentication required.', details = []) {
    return new AppError(401, ERROR_CODES.UNAUTHORIZED, message, details);
  }

  static forbidden(message = 'You do not have permission to do that.', details = []) {
    return new AppError(403, ERROR_CODES.FORBIDDEN, message, details);
  }

  static notFound(message, details = []) {
    return new AppError(404, ERROR_CODES.NOT_FOUND, message, details);
  }

  static conflict(message, details = []) {
    return new AppError(409, ERROR_CODES.CONFLICT, message, details);
  }

  static invalidTransition(message, details = []) {
    return new AppError(422, ERROR_CODES.INVALID_TRANSITION, message, details);
  }

  static serviceUnavailable(message, details = []) {
    return new AppError(503, ERROR_CODES.SERVICE_UNAVAILABLE, message, details);
  }
}
