import { Router } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../common/middlewares/authenticate';
import { rateLimit } from '../../common/middlewares/rateLimit';
import { validate } from '../../common/middlewares/validate';
import * as controller from './auth.controller';
import { loginSchema, registerSchema, resendOtpSchema, verifyOtpSchema } from './auth.schema';

const router = Router();

// Generous enough for a real user on a flaky connection, tight enough that the
// endpoint cannot be used to spam inboxes.
const authLimiter = rateLimit({ windowMs: 60_000, max: 30, code: 'RATE_LIMITED' });

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(controller.register));
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), asyncHandler(controller.verifyOtp));
router.post('/resend-otp', authLimiter, validate(resendOtpSchema), asyncHandler(controller.resendOtp));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(controller.login));

/** Lets the app validate a restored token on cold start before showing a screen. */
router.get('/me', authenticate, asyncHandler(controller.me));

export default router;
