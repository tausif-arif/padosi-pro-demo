import { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { mailPreviewUrl } from '../../config/mailer';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      service: 'padosipro-api',
      environment: env.NODE_ENV,
      mailPreviewUrl: mailPreviewUrl(),
      timestamp: new Date().toISOString(),
    });
  }),
);

export default router;
