import { apiClient } from '@/services/apiClient';
import type { AuthUser } from '@/types/api';

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface RegisterResult {
  user: AuthUser;
  message: string;
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResult> {
  const { data } = await apiClient.post<RegisterResult>('/auth/register', payload);
  return data;
}
