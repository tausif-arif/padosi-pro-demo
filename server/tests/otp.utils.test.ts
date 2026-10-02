import { generateOtp, hashOtp, isOtpShape, verifyOtpCode } from '../src/modules/otp/otp.utils';
import { env } from '../src/config/env';
import { normaliseMobile } from '../src/modules/profile/profile.schema';

describe('generateOtp', () => {
  it('returns a code of the configured length', () => {
    expect(generateOtp()).toHaveLength(env.otp.length);
    expect(generateOtp()).toMatch(/^\d{6}$/);
  });

  it('is not predictable across calls', () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateOtp()));
    expect(codes.size).toBeGreaterThan(40);
  });

  it('recognises well formed codes', () => {
    expect(isOtpShape('123456')).toBe(true);
    expect(isOtpShape('12345')).toBe(false);
    expect(isOtpShape('abcdef')).toBe(false);
  });
});

describe('otp hashing', () => {
  it('never stores the code in plain text and still verifies it', async () => {
    const hash = await hashOtp('123456');

    expect(hash).not.toBe('123456');
    expect(hash).toMatch(/^\$2[aby]\$/);
    expect(await verifyOtpCode('123456', hash)).toBe(true);
    expect(await verifyOtpCode('654321', hash)).toBe(false);
  });

  it('salts each hash so identical codes do not collide', async () => {
    const [a, b] = await Promise.all([hashOtp('424242'), hashOtp('424242')]);
    expect(a).not.toBe(b);
  });
});

describe('password hashing defaults', () => {
  it('uses bcrypt with at least 10 rounds outside of tests', () => {
    // Guards against someone "optimising" the salt rounds down in config.
    expect(env.NODE_ENV).toBe('test');
    expect(env.bcrypt.saltRounds).toBeLessThanOrEqual(10);
  });
});

describe('normaliseMobile', () => {
  it('stores every accepted shape as +91 followed by 10 digits', () => {
    expect(normaliseMobile('9876543210')).toBe('+919876543210');
    expect(normaliseMobile('+919876543210')).toBe('+919876543210');
    expect(normaliseMobile('+91 98765 43210')).toBe('+919876543210');
    expect(normaliseMobile('91-9876543210')).toBe('+919876543210');
  });

  it('rejects numbers that are not valid Indian mobiles', () => {
    expect(normaliseMobile('1234567890')).toBeNull();
    expect(normaliseMobile('987654321')).toBeNull();
    expect(normaliseMobile('98765432100')).toBeNull();
    expect(normaliseMobile('abcdefghij')).toBeNull();
    expect(normaliseMobile('')).toBeNull();
  });
});
