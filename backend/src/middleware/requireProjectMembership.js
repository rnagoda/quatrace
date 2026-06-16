// Write gate for project-scoped resources. Run after loadProject: the caller must
// be a member of the project and not a viewer. This is what lets a tester manage
// defects on their active project while staying read-only on other projects (§3.2).
import { findMembership } from '../models/projectMemberModel.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireProjectMembership = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'viewer') {
    throw AppError.forbidden('Viewers have read-only access.');
  }
  const membership = await findMembership(req.project.id, req.user.id);
  if (!membership) {
    throw AppError.forbidden('You are not a member of this project.');
  }
  next();
});
