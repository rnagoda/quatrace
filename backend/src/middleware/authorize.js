// Role-based access control. Use after `authenticate`: authorize('admin', 'manager')
// allows only those roles through, otherwise 403. RBAC is enforced on every
// protected endpoint (PRD §3.3).
import { AppError } from '../utils/AppError.js';

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw AppError.forbidden();
    }
    next();
  };
}
