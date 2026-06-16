// Loads the project named by :id and enforces organization scoping. A project in
// another org (or a nonexistent id) resolves to 404 — never 403 — so cross-org
// existence is not leaked. Attaches req.project for downstream handlers.
import { findById } from '../models/projectModel.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const loadProject = asyncHandler(async (req, res, next) => {
  const project = await findById(req.params.id);
  if (!project || project.organization_id !== req.user.organizationId) {
    throw AppError.notFound('Project not found.');
  }
  req.project = project;
  next();
});
