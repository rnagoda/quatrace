// Validation middleware. Parses a request part (body by default, or query) with a
// Zod schema; on failure it throws a 400 AppError carrying field-level details for
// the error envelope. Reused by every endpoint that accepts input.
import { AppError } from '../utils/AppError.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      throw AppError.badRequest('Validation failed.', details);
    }
    req[source] = result.data;
    next();
  };
}
