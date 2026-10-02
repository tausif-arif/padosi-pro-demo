import { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate, requireVerified } from '../../common/middlewares/authenticate';
import { validate } from '../../common/middlewares/validate';
import * as controller from './tasks.controller';
import { listTasksSchema, saveSelectionSchema } from './tasks.schema';

const router = Router();

router.use(authenticate, requireVerified);

router.get('/', validate(listTasksSchema, 'query'), asyncHandler(controller.listTasks));
router.get('/selected', asyncHandler(controller.getSelectedTasks));
router.post('/selected', validate(saveSelectionSchema), asyncHandler(controller.saveSelection));

export default router;
