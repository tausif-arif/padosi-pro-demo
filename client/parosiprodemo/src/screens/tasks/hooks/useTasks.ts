import NAVIGATION_STRINGS from '@/constants/navigationStrings';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@/navigation/types';
import { showToast } from '@/store/toastStore';
import type { Task } from '@/types/api';
import { toAppError, type AppError } from '@/utils/apiError';
import { fetchCatalogue, saveSelection } from '../api';

export type TasksNavigation = NativeStackNavigationProp<AppStackParamList, typeof NAVIGATION_STRINGS.TASKS>;

export interface TaskSection {
  title: string;
  data: Task[];
}

function matches(task: Task, query: string): boolean {
  if (!query) return true;
  return (
    task.title.toLowerCase().includes(query) ||
    task.category.toLowerCase().includes(query) ||
    task.description.toLowerCase().includes(query)
  );
}

export function useTasks(navigation: TasksNavigation) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [initialSelectedIds, setInitialSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<AppError | null>(null);

  const load = useCallback(
    () =>
      fetchCatalogue()
        .then((catalogue) => {
          setTasks(catalogue.tasks);
          setCategories(catalogue.categories);
          setSelectedIds(catalogue.selectedTaskIds);
          setInitialSelectedIds(catalogue.selectedTaskIds);
          setServerError(null);
          setLoading(false);
          setRefreshing(false);
        })
        .catch((error: unknown) => {
          const appError = toAppError(error);
          setServerError(appError);
          showToast(appError.message);
          setLoading(false);
          setRefreshing(false);
        }),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const sections = useMemo<TaskSection[]>(() => {
    const query = search.trim().toLowerCase();
    const visible = tasks.filter((task) => matches(task, query));
    const order = [
      ...categories,
      ...visible.map((task) => task.category).filter((name) => !categories.includes(name)),
    ];

    return order
      .map((title) => ({ title, data: visible.filter((task) => task.category === title) }))
      .filter((section) => section.data.length > 0);
  }, [categories, search, tasks]);

  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

  const confirm = async () => {
    if (selectedIds.length === 0) return;

    const isUnchanged =
      selectedIds.length === initialSelectedIds.length &&
      selectedIds.every((id) => initialSelectedIds.includes(id));

    if (isUnchanged) {
      navigation.popToTop();
      return;
    }

    setSubmitting(true);
    setServerError(null);
    try {
      await saveSelection(selectedIds);
      navigation.popToTop();
      showToast(`${selectedIds.length} task${selectedIds.length === 1 ? '' : 's'} saved`, 'success');
    } catch (error) {
      const appError = toAppError(error);
      setServerError(appError);
      showToast(appError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    sections,
    search,
    selectedCount: selectedIds.length,
    loading,
    refreshing,
    submitting,
    serverError,
    hasNoMatches: !loading && tasks.length > 0 && sections.length === 0,
    isSelected: (taskId: string) => selected.has(taskId),
    onChangeSearch: setSearch,
    onRefresh: () => {
      setRefreshing(true);
      void load();
    },
    onRetry: () => {
      setLoading(true);
      void load();
    },
    onConfirm: confirm,
    onToggleTask: (task: Task) =>
      setSelectedIds((current) =>
        current.includes(task.id) ? current.filter((id) => id !== task.id) : [...current, task.id],
      ),
  };
}
