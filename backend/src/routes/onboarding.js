import { Router } from 'express';
import { complete } from '../controllers/onboardingController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { onboardingSchema } from '../validators/onboardingSchema.js';

const router = Router();

router.use(authenticate);
router.post('/', validate(onboardingSchema), asyncHandler(complete));

export default router;
