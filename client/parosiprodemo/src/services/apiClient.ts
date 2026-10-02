import { create } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { toAppError } from '@/utils/apiError';
import { Config } from '@/config';

export const API_BASE_URL = Config.API_URL;

export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const appError = toAppError(error);

    if (appError.status === 401) {
      void useAuthStore.getState().signOut();
    }

    return Promise.reject(appError);
  },
);
