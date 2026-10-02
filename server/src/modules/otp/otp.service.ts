import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { sendMail } from '../../config/mailer';
import { buildOtpEmail } from './otp.mail';
import { generateOtp, hashOtp, verifyOtpCode } from './otp.utils';
import {
  cooldownError,
  isLockedOut,
  otpExpired,
  remainingCooldownSeconds,
  verdictForExpired,
  verdictForLocked,
  verdictForMismatch,
  verdictForMissing,
  verdictForSuccess,
  type OtpVerdict,
} from './otp.policy';

export interface IssuedOtp {
  /** Only ever returned to the mailer and to tests, never over HTTP. */
  code: string;
  expiresAt: Date;
  resendAvailableInSeconds: number;
}

export async function issueOtp(userId: string, email: string): Promise<IssuedOtp> {
  const code = generateOtp(env.otp.length);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.otp.ttlMs);

  await prisma.emailOtp.deleteMany({ where: { userId, consumedAt: null } });
  await prisma.emailOtp.create({
    data: { userId, otpHash: await hashOtp(code), expiresAt, lastSentAt: now },
  });

  const mail = buildOtpEmail(email, code);
  await sendMail({ to: email, ...mail });

  return { code, expiresAt, resendAvailableInSeconds: env.otp.resendCooldownMs / 1000 };
}

export async function resendOtp(userId: string, email: string): Promise<IssuedOtp> {
  const active = await prisma.emailOtp.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { lastSentAt: 'desc' },
  });

  const waitSeconds = remainingCooldownSeconds(active?.lastSentAt ?? null);
  if (waitSeconds > 0) throw cooldownError(waitSeconds);

  return issueOtp(userId, email);
}

async function activeOtp(userId: string) {
  return prisma.emailOtp.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { lastSentAt: 'desc' },
  });
}

export async function verifyOtpForUser(userId: string, code: string): Promise<OtpVerdict> {
  const record = await activeOtp(userId);
  if (!record) return verdictForMissing();

  if (isLockedOut(record.attempts)) return verdictForLocked(record.attempts);
  if (otpExpired(record.expiresAt)) return verdictForExpired();

  const matches = await verifyOtpCode(code, record.otpHash);

  if (!matches) {
    const attemptsUsed = record.attempts + 1;
    await prisma.emailOtp.update({ where: { id: record.id }, data: { attempts: attemptsUsed } });
    return isLockedOut(attemptsUsed) ? verdictForLocked(attemptsUsed) : verdictForMismatch(attemptsUsed);
  }

  await prisma.$transaction([
    prisma.emailOtp.update({
      where: { id: record.id },
      data: { consumedAt: new Date(), attempts: record.attempts + 1 },
    }),
    prisma.user.update({ where: { id: userId }, data: { isVerified: true } }),
  ]);

  return verdictForSuccess();
}

export async function secondsUntilResend(userId: string): Promise<number> {
  const record = await activeOtp(userId);
  return remainingCooldownSeconds(record?.lastSentAt ?? null);
}
