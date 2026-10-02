import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_URL: z.string().url(),
});

const parsed = schema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  API_URL: process.env.EXPO_PUBLIC_API_URL,
});

if (!parsed.success) {
  throw new Error('Invalid environment configuration');
}

const raw = parsed.data;

const ENVIRONMENT_CONFIG = {
  development: {
    API_URL: String(process.env.EXPO_PUBLIC_API_URL),
  },
  test: {
    API_URL: String(process.env.EXPO_PUBLIC_API_URL),
  },
  production: {
    API_URL: String(process.env.EXPO_PUBLIC_API_URL),
  },
};

export const Config = {
  ...raw,
  API_URL: ENVIRONMENT_CONFIG[raw.NODE_ENV].API_URL,
  isTest: raw.NODE_ENV === 'test',
  isProduction: raw.NODE_ENV === 'production',
  isDevelopment: raw.NODE_ENV === 'development',
} as const;
