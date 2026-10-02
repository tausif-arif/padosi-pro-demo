import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from '../../config/env';

function randomDigit(): number {
  for (;;) {
    const bucket = crypto.randomBytes(1)[0] as number;
    if (bucket < 250) return bucket % 10;
  }
}

/** Cryptographically random numeric OTP, e.g. `generateOtp(6)` -> `"481302"`. */
export function generateOtp(length = env.otp.length): string {
  let code = '';
  for (let index = 0; index < length; index += 1) code += String(randomDigit());
  return code;
}

export function isOtpShape(value: string): boolean {
  return new RegExp(`^\\d{${env.otp.length}}$`).test(value);
}

export function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, env.bcrypt.saltRounds);
}

export function verifyOtpCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}
