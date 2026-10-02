import { apiClient } from '@/services/apiClient';
import type { SelectedTasks, Task, TaskCatalogue } from '@/types/api';

export interface SaveSelectionResult {
  tasks: Task[];
  count: number;
  message: string;
}

export async function fetchCatalogue(search?: string): Promise<TaskCatalogue> {
  const { data } = await apiClient.get<TaskCatalogue>('/tasks', {
    params: search ? { search } : undefined,
  });
  return data;
}

export async function fetchSelection(): Promise<SelectedTasks> {
  const { data } = await apiClient.get<SelectedTasks>('/tasks/selected');
  return data;
}

export async function saveSelection(taskIds: string[]): Promise<SaveSelectionResult> {
  const { data } = await apiClient.post<SaveSelectionResult>('/tasks/selected', { taskIds });
  return data;
}
