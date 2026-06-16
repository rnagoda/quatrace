// Mounts all domain routers under /api. New domains add one line here.
import { Router } from 'express';
import healthRoutes from './health.js';

const router = Router();

router.use('/health', healthRoutes);

export default router;
