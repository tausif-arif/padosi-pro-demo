import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { ApiError } from '../../common/errors/apiError';
import { signAccessToken } from '../../common/middlewares/authenticate';
import { hashPassword, verifyPassword } from './password';
import { issueOtp, resendOtp as issueResend, secondsUntilResend, verifyOtpForUser } from '../otp/otp.service';
import type { LoginInput, RegisterInput, ResendOtpInput, VerifyOtpInput } from './auth.schema';

export interface PublicUser {
  id: string;
  email: string;
  isVerified: boolean;
  createdAt: Date;
  hasProfile: boolean;
}

function toPublicUser(user: {
  id: string;
  email: string;
  isVerified: boolean;
  createdAt: Date;
  profile: { id: string } | null;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    hasProfile: user.profile !== null,
  };
}

const userSelect = {
  id: true,
  email: true,
  isVerified: true,
  createdAt: true,
  profile: { select: { id: true } },
} as const;

export async function register({ email, password }: RegisterInput): Promise<{ user: PublicUser }> {
  const existing = await prisma.user.findUnique({ where: { email } });
  
  if (existing) {
    if (existing.isVerified) {
      throw ApiError.conflict('EMAIL_TAKEN', 'An account with that email already exists');
    }
    
    // User exists but never verified. Treat as a fresh registration.
    const user = await prisma.user.update({
      where: { email },
      data: { passwordHash: await hashPassword(password) },
      select: userSelect,
    });
    
    await issueOtp(user.id, user.email);
    return { user: toPublicUser(user) };
  }

  const user = await prisma.user.create({
    data: { email, passwordHash: await hashPassword(password) },
    select: userSelect,
  });

  await issueOtp(user.id, user.email);

  return { user: toPublicUser(user) };
}

export async function login({ email, password }: LoginInput): Promise<{ token: string; user: PublicUser }> {
  const user = await prisma.user.findUnique({ where: { email }, select: { ...userSelect, passwordHash: true } });

  if (!user) {
    throw ApiError.unauthorized('INVALID_CREDENTIALS', 'Email or password is incorrect');
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    throw ApiError.unauthorized('INVALID_CREDENTIALS', 'Email or password is incorrect');
  }

  return { token: signAccessToken(user), user: toPublicUser(user) };
}

export async function verifyOtp({ email, otp }: VerifyOtpInput): Promise<{ token: string; user: PublicUser }> {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!existing) throw ApiError.notFound('USER_NOT_FOUND', 'No account exists for that email');

  const verdict = await verifyOtpForUser(existing.id, otp);
  if (!verdict.ok) {
    throw new ApiError(verdict.status, verdict.code, verdict.message, {
      attemptsUsed: verdict.attemptsUsed,
      attemptsRemaining: verdict.attemptsRemaining,
    });
  }

  const verifiedUser = await getProfileStatus(existing.id);
  return { token: signAccessToken(verifiedUser), user: verifiedUser };
}

export async function getProfileStatus(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: userSelect });
  return toPublicUser(user);
}

export async function resendOtp({ email }: ResendOtpInput): Promise<{ resendAvailableInSeconds: number; expiresAt: Date }> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, isVerified: true } });
  if (!user) throw ApiError.notFound('USER_NOT_FOUND', 'No account exists for that email');
  if (user.isVerified) throw ApiError.conflict('ALREADY_VERIFIED', 'This email is already verified, please sign in');

  const { code: _code, ...issued } = await issueResend(user.id, user.email);
  return { resendAvailableInSeconds: env.otp.resendCooldownMs / 1000, expiresAt: issued.expiresAt };
}

export async function cooldownRemaining(email: string): Promise<number> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user ? secondsUntilResend(user.id) : 0;
}
