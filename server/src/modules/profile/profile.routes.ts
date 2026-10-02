import { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate, requireVerified } from '../../common/middlewares/authenticate';
import { validate } from '../../common/middlewares/validate';
import * as controller from './profile.controller';
import { upsertProfileSchema } from './profile.schema';

const router = Router();

router.use(authenticate, requireVerified);

router.get('/', asyncHandler(controller.fetchProfile));
router.put('/', validate(upsertProfileSchema), asyncHandler(controller.saveProfile));

export default router;
