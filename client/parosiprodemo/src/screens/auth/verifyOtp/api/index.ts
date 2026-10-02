import { apiClient } from '@/services/apiClient';
import type { AuthUser } from '@/types/api';

export interface VerifyOtpResult {
  token: string;
  user: AuthUser;
  message: string;
}

export interface ResendOtpResult {
  resendAvailableInSeconds: number;
  expiresAt: string;
  message: string;
}

export async function verifyOtp(email: string, otp: string): Promise<VerifyOtpResult> {
  const { data } = await apiClient.post<VerifyOtpResult>('/auth/verify-otp', { email, otp });
  return data;
}

export async function resendOtp(email: string): Promise<ResendOtpResult> {
  const { data } = await apiClient.post<ResendOtpResult>('/auth/resend-otp', { email });
  return data;
}
