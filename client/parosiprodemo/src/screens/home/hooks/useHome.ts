import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { showToast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import type { Profile, Task } from '@/types/api';
import { toAppError, type AppError } from '@/utils/apiError';
import { greetingFor } from '@/utils/format';
import { fetchProfile, fetchSelectedTasks } from '../api';

export interface TaskGroup {
  title: string;
  data: Task[];
}

export function useHome() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serverError, setServerError] = useState<AppError | null>(null);

  const load = useCallback(
    () =>
      Promise.allSettled([fetchSelectedTasks(), fetchProfile()]).then(([selected, savedProfile]) => {
        if (selected.status === 'fulfilled') {
          setTasks(selected.value.tasks);
          setServerError(null);
        } else {
          const appError = toAppError(selected.reason);
          setServerError(appError);
          showToast(appError.message);
        }

        if (savedProfile.status === 'fulfilled') setProfile(savedProfile.value);
        setLoading(false);
        setRefreshing(false);
      }),
    [],
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const groups = useMemo<TaskGroup[]>(() => {
    const order: string[] = [];
    for (const task of tasks) {
      if (!order.includes(task.category)) order.push(task.category);
    }
    return order.map((title) => ({ title, data: tasks.filter((task) => task.category === title) }));
  }, [tasks]);

  return {
    name: profile?.name ?? 'Guest',
    groups,
    profile,
    loading,
    refreshing,
    serverError,
    onRefresh: () => {
      setRefreshing(true);
      void load();
    },
    onRetry: () => {
      setLoading(true);
      void load();
    },
    onSignOut: () => {
      void useAuthStore.getState().signOut();
    },
  };
}
