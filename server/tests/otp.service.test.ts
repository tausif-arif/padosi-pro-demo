import { prisma, createRegisteredUser, backdateLastSentAt, expireActiveOtp } from './helpers';
import { latestOtpFor } from './mailHelper';
import { issueOtp, resendOtp, verifyOtpForUser } from '../src/modules/otp/otp.service';
import { env } from '../src/config/env';
import { OtpErrorCode } from '../src/modules/otp/otp.policy';

describe('otp issue', () => {
  it('stores a hash of the code, never the code itself', async () => {
    const user = await createRegisteredUser();
    const row = await prisma.emailOtp.findFirst({ where: { userId: user.id } });

    expect(row).not.toBeNull();
    expect(row?.otpHash).not.toBe(user.otp);
    expect(row?.otpHash).toMatch(/^\$2[aby]\$/);
    expect(row?.attempts).toBe(0);
  });

  it('expires the code after the configured window', async () => {
    const user = await createRegisteredUser();
    const row = await prisma.emailOtp.findFirstOrThrow({ where: { userId: user.id } });

    const ttl = row.expiresAt.getTime() - row.lastSentAt.getTime();
    expect(ttl).toBe(env.otp.ttlMs);
  });
});

describe('otp verification', () => {
  it('verifies the right code and flips is_verified', async () => {
    const user = await createRegisteredUser();

    const verdict = await verifyOtpForUser(user.id, user.otp);

    expect(verdict.ok).toBe(true);
    const row = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(row.isVerified).toBe(true);
  });

  it('rejects a wrong code and reports the attempts left', async () => {
    const user = await createRegisteredUser();

    const verdict = await verifyOtpForUser(user.id, '000000');

    expect(verdict.ok).toBe(false);
    expect(verdict.code).toBe(OtpErrorCode.INVALID);
    expect(verdict.attemptsUsed).toBe(1);
    expect(verdict.attemptsRemaining).toBe(4);
  });

  it('rejects an expired code without spending an attempt', async () => {
    const user = await createRegisteredUser();
    await expireActiveOtp(user.id);

    const verdict = await verifyOtpForUser(user.id, user.otp);

    expect(verdict.ok).toBe(false);
    expect(verdict.code).toBe(OtpErrorCode.EXPIRED);
    const row = await prisma.emailOtp.findFirstOrThrow({ where: { userId: user.id } });
    expect(row.attempts).toBe(0);
  });

  it('locks out after 5 wrong attempts and refuses the correct code afterwards', async () => {
    const user = await createRegisteredUser();

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      const verdict = await verifyOtpForUser(user.id, '111111');
      expect(verdict.attemptsUsed).toBe(attempt);
    }

    const fifth = await verifyOtpForUser(user.id, '111111');
    expect(fifth.code).toBe(OtpErrorCode.LOCKED);
    expect(fifth.attemptsRemaining).toBe(0);

    const withRealCode = await verifyOtpForUser(user.id, user.otp);
    expect(withRealCode.ok).toBe(false);
    expect(withRealCode.code).toBe(OtpErrorCode.LOCKED);

    const row = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(row.isVerified).toBe(false);
  });

  it('treats a code as single use', async () => {
    const user = await createRegisteredUser();

    expect((await verifyOtpForUser(user.id, user.otp)).ok).toBe(true);
    const second = await verifyOtpForUser(user.id, user.otp);

    expect(second.ok).toBe(false);
    expect(second.code).toBe(OtpErrorCode.NOT_FOUND);
  });
});

describe('otp resend cooldown', () => {
  it('blocks a resend inside the 30 second window', async () => {
    const user = await createRegisteredUser();

    await expect(resendOtp(user.id, user.email)).rejects.toMatchObject({
      code: OtpErrorCode.COOLDOWN,
      status: 429,
    });
  });

  it('reports how many seconds are left', async () => {
    const user = await createRegisteredUser();
    await backdateLastSentAt(user.id, 10);

    await expect(resendOtp(user.id, user.email)).rejects.toMatchObject({
      details: { retryAfter: 20 },
    });
  });

  it('allows a resend once the cooldown has passed', async () => {
    const user = await createRegisteredUser();
    await backdateLastSentAt(user.id, 31);

    const issued = await resendOtp(user.id, user.email);

    expect(issued.resendAvailableInSeconds).toBe(30);
    expect(await latestOtpFor(user.email)).toMatch(/^\d{6}$/);
  });

  it('invalidates the previous code when a new one is sent', async () => {
    const user = await createRegisteredUser();
    const oldCode = user.otp;
    await backdateLastSentAt(user.id, 31);

    const issued = await resendOtp(user.id, user.email);

    expect((await verifyOtpForUser(user.id, oldCode)).code).toBe(OtpErrorCode.INVALID);
    expect((await verifyOtpForUser(user.id, issued.code)).ok).toBe(true);
  });

  it('resets the attempt counter with the new code', async () => {
    const user = await createRegisteredUser();
    for (let attempt = 0; attempt < 3; attempt += 1) await verifyOtpForUser(user.id, '222222');

    await backdateLastSentAt(user.id, 31);
    await resendOtp(user.id, user.email);

    const row = await prisma.emailOtp.findFirstOrThrow({ where: { userId: user.id, consumedAt: null } });
    expect(row.attempts).toBe(0);
  });

  it('keeps only the newest code on file', async () => {
    const user = await createRegisteredUser();
    await backdateLastSentAt(user.id, 31);
    await issueOtp(user.id, user.email);

    const rows = await prisma.emailOtp.findMany({ where: { userId: user.id } });
    expect(rows).toHaveLength(1);
  });
});
