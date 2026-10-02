import { z } from 'zod';
import { env } from '../../config/env';

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(254, 'Email is too long');

export const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a number');

/** Exactly the configured number of digits, so "12345" never reaches the service. */
export const otpField = z
  .string()
  .trim()
  .regex(new RegExp(`^\\d{${env.otp.length}}$`), `Enter the ${env.otp.length} digit code from your email`);

export const registerSchema = z.object({
  email: emailField,
  password: passwordField,
});

export const verifyOtpSchema = z.object({
  email: emailField,
  otp: otpField,
});

export const resendOtpSchema = z.object({
  email: emailField,
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required').max(72, 'Password is too long'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
