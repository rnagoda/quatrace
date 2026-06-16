import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { loadProject } from '../middleware/loadProject.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  listProjectsQuerySchema,
} from '../validators/projectSchemas.js';

const router = Router();

// Every project endpoint requires authentication.
router.use(authenticate);

// Reads: any authenticated org member (org scoping enforced per-resource).
router.get('/', validate(listProjectsQuerySchema, 'query'), asyncHandler(projectController.list));
router.get('/:id', loadProject, asyncHandler(projectController.getOne));
router.get('/:id/members', loadProject, asyncHandler(projectController.listMembers));

// Writes: Manager/Admin only.
router.post(
  '/',
  authorize('manager', 'admin'),
  validate(createProjectSchema),
  asyncHandler(projectController.create),
);
router.patch(
  '/:id',
  authorize('manager', 'admin'),
  loadProject,
  validate(updateProjectSchema),
  asyncHandler(projectController.update),
);
router.post(
  '/:id/members',
  authorize('manager', 'admin'),
  loadProject,
  validate(addMemberSchema),
  asyncHandler(projectController.addMember),
);
router.delete(
  '/:id/members/:userId',
  authorize('manager', 'admin'),
  loadProject,
  asyncHandler(projectController.removeMember),
);

export default router;
