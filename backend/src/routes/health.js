import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// GET /api/health — liveness + database readiness.
router.get('/', asyncHandler(getHealth));

export default router;
