import { env } from '../../config/env';
import { ApiError } from '../../common/errors/apiError';

export const OtpErrorCode = {
  NOT_FOUND: 'OTP_NOT_FOUND',
  EXPIRED: 'OTP_EXPIRED',
  LOCKED: 'OTP_LOCKED',
  INVALID: 'OTP_INVALID',
  COOLDOWN: 'OTP_RESEND_COOLDOWN',
} as const;

export interface OtpVerdict {
  ok: boolean;
  status: number;
  code: string;
  message: string;
  attemptsUsed: number;
  attemptsRemaining: number;
}

function verdict(overrides: Partial<OtpVerdict> = {}): OtpVerdict {
  return {
    ok: false,
    status: 400,
    code: OtpErrorCode.INVALID,
    message: 'That code is not correct',
    attemptsUsed: 0,
    attemptsRemaining: env.otp.maxAttempts,
    ...overrides,
  };
}

export function otpExpired(expiresAt: Date, now: Date = new Date()): boolean {
  return now.getTime() > expiresAt.getTime();
}

export function isLockedOut(attempts: number): boolean {
  return attempts >= env.otp.maxAttempts;
}

export function remainingCooldownSeconds(lastSentAt: Date | null, now: Date = new Date()): number {
  if (!lastSentAt) return 0;
  const elapsed = now.getTime() - lastSentAt.getTime();
  const remaining = env.otp.resendCooldownMs - elapsed;
  return remaining <= 0 ? 0 : Math.ceil(remaining / 1000);
}

export function cooldownError(retryAfter: number): ApiError {
  return ApiError.tooManyRequests(
    OtpErrorCode.COOLDOWN,
    `Please wait ${retryAfter}s before requesting a new code`,
    { retryAfter },
  );
}

export function verdictForMissing(): OtpVerdict {
  return verdict({
    status: 404,
    code: OtpErrorCode.NOT_FOUND,
    message: 'No active verification code, request a new one',
  });
}

export function verdictForExpired(): OtpVerdict {
  return verdict({
    status: 400,
    code: OtpErrorCode.EXPIRED,
    message: 'That code has expired, request a new one',
  });
}

export function verdictForLocked(attemptsUsed: number): OtpVerdict {
  return verdict({
    status: 403,
    code: OtpErrorCode.LOCKED,
    message: 'Too many incorrect attempts, request a new code',
    attemptsUsed,
    attemptsRemaining: 0,
  });
}

export function verdictForMismatch(attemptsUsed: number): OtpVerdict {
  const remaining = Math.max(0, env.otp.maxAttempts - attemptsUsed);
  return verdict({
    code: OtpErrorCode.INVALID,
    message:
      remaining > 0
        ? `That code is not correct. ${remaining} attempt${remaining === 1 ? '' : 's'} left`
        : 'That code is not correct',
    attemptsUsed,
    attemptsRemaining: remaining,
  });
}

export function verdictForSuccess(): OtpVerdict {
  return verdict({ ok: true, code: 'OK', message: 'Email verified' });
}
