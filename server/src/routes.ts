import { Router } from 'express';
import { authRouter } from './modules/auth';
import { profileRouter } from './modules/profile';
import { tasksRouter } from './modules/tasks';
import { healthRouter } from './modules/health';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/profile', profileRouter);
router.use('/tasks', tasksRouter);

export default router;
