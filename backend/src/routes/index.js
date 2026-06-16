// Mounts all domain routers under /api. New domains add one line here.
import { Router } from 'express';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import projectRoutes from './projects.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);

export default router;
