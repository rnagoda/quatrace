// Loads the defect named by :defectId and confirms it belongs to req.project.
// A defect in another project (or a missing id) resolves to 404. Attaches req.defect.
import { findById } from '../models/defectModel.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const loadDefect = asyncHandler(async (req, res, next) => {
  const defect = await findById(req.params.defectId);
  if (!defect || defect.project_id !== req.project.id) {
    throw AppError.notFound('Defect not found.');
  }
  req.defect = defect;
  next();
});
