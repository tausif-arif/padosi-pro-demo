import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const booleanish = z
  .string()
  .optional()
  .transform((value) => value === 'true' || value === '1');

const numeric = (fallback: number) =>
  z.coerce.number().int().positive().default(fallback);

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: numeric(4000),
  API_BASE_URL: z.string().url().default('http://localhost:4000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  OTP_LENGTH: z.coerce.number().int().min(4).max(8).default(6),
  OTP_TTL_MINUTES: numeric(10),
  OTP_MAX_ATTEMPTS: numeric(5),
  OTP_RESEND_COOLDOWN_SECONDS: numeric(30),

  BCRYPT_SALT_ROUNDS: numeric(10),

  MAIL_TRANSPORT: z.enum(['ethereal', 'smtp', 'json']).default('ethereal'),
  MAIL_FROM_NAME: z.string().default('PadosiPro'),
  MAIL_FROM_ADDRESS: z.string(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: numeric(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_DEBUG: booleanish,
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);
  // Fail fast and loudly: a half-configured API is worse than one that refuses to start.
  throw new Error(`Invalid environment configuration:\n${issues.join('\n')}`);
}

const raw = parsed.data;

export const env = {
  ...raw,
  isTest: raw.NODE_ENV === 'test',
  isProduction: raw.NODE_ENV === 'production',
  otp: {
    length: raw.OTP_LENGTH,
    ttlMs: raw.OTP_TTL_MINUTES * 60 * 1000,
    maxAttempts: raw.OTP_MAX_ATTEMPTS,
    resendCooldownMs: raw.OTP_RESEND_COOLDOWN_SECONDS * 1000,
  },
  bcrypt: {
    saltRounds: raw.BCRYPT_SALT_ROUNDS,
  },
  jwt: {
    secret: raw.JWT_SECRET,
    expiresIn: raw.JWT_EXPIRES_IN,
  },
} as const;

export type Env = typeof env;
