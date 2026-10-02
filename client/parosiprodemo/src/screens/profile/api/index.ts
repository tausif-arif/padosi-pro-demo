import { apiClient } from '@/services/apiClient';
import type { Profile, ProfilePayload } from '@/types/api';

export interface SaveProfileResult {
  profile: Profile;
  message: string;
}

export async function fetchProfile(): Promise<Profile | null> {
  const { data } = await apiClient.get<{ profile: Profile | null }>('/profile');
  return data.profile;
}

export async function saveProfile(payload: ProfilePayload): Promise<SaveProfileResult> {
  const { data } = await apiClient.put<SaveProfileResult>('/profile', payload);
  return data;
}
