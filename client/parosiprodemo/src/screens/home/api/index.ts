import { apiClient } from '@/services/apiClient';
import type { Profile, SelectedTasks } from '@/types/api';

export async function fetchSelectedTasks(): Promise<SelectedTasks> {
  const { data } = await apiClient.get<SelectedTasks>('/tasks/selected');
  return data;
}

export async function fetchProfile(): Promise<Profile | null> {
  const { data } = await apiClient.get<{ profile: Profile | null }>('/profile');
  return data.profile;
}
