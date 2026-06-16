import { Router } from 'express';
import * as defectController from '../controllers/defectController.js';
import { loadProject } from '../middleware/loadProject.js';
import { loadDefect } from '../middleware/loadDefect.js';
import { requireProjectMembership } from '../middleware/requireProjectMembership.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createDefectSchema,
  updateDefectSchema,
  transitionSchema,
  addCommentSchema,
  listDefectsQuerySchema,
} from '../validators/defectSchemas.js';

// mergeParams lets this nested router read :id (the project) from the parent route.
const router = Router({ mergeParams: true });

// Reads: any org member (loadProject enforces org scoping → 404).
router.get('/', loadProject, validate(listDefectsQuerySchema, 'query'), asyncHandler(defectController.list));
router.get('/:defectId', loadProject, loadDefect, asyncHandler(defectController.getOne));
router.get(
  '/:defectId/comments',
  loadProject,
  loadDefect,
  asyncHandler(defectController.listComments),
);

// Writes: project members only (and not viewers).
router.post(
  '/',
  loadProject,
  requireProjectMembership,
  validate(createDefectSchema),
  asyncHandler(defectController.create),
);
router.patch(
  '/:defectId',
  loadProject,
  requireProjectMembership,
  loadDefect,
  validate(updateDefectSchema),
  asyncHandler(defectController.update),
);
router.post(
  '/:defectId/transition',
  loadProject,
  requireProjectMembership,
  loadDefect,
  validate(transitionSchema),
  asyncHandler(defectController.transition),
);
router.post(
  '/:defectId/comments',
  loadProject,
  requireProjectMembership,
  loadDefect,
  validate(addCommentSchema),
  asyncHandler(defectController.addComment),
);

export default router;
