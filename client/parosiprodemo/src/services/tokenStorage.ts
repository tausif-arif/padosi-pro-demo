import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// SecureStore has no web build, so web falls back to localStorage.
const secureStore = {
  getItem: (key: string): Promise<string | null> =>
    Platform.OS === 'web' ? Promise.resolve(localStorage.getItem(key)) : SecureStore.getItemAsync(key),
  setItem: (key: string, value: string): Promise<void> =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.setItem(key, value))
      : SecureStore.setItemAsync(key, value),
  removeItem: (key: string): Promise<void> =>
    Platform.OS === 'web'
      ? Promise.resolve(localStorage.removeItem(key))
      : SecureStore.deleteItemAsync(key),
};

export const tokenStorage = {
  read: (): Promise<string | null> => secureStore.getItem(TOKEN_KEY),
  write: (token: string): Promise<void> => secureStore.setItem(TOKEN_KEY, token),
  clear: (): Promise<void> => secureStore.removeItem(TOKEN_KEY),
};

export const userStorage = {
  read: (): Promise<string | null> => secureStore.getItem(USER_KEY),
  write: (user: unknown): Promise<void> => secureStore.setItem(USER_KEY, JSON.stringify(user)),
  clear: (): Promise<void> => secureStore.removeItem(USER_KEY),
};
