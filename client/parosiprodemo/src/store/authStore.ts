import { create } from 'zustand';
import type { AuthUser } from '@/types/api';
import { tokenStorage, userStorage } from '@/services/tokenStorage';

export type AuthStatus = 'restoring' | 'signedOut' | 'signedIn';

interface AuthState {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
  /** Called once on boot to bring a returning user back in. */
  restore: () => Promise<void>;
  signIn: (token: string, user: AuthUser) => Promise<void>;
  updateUser: (user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'restoring',
  token: null,
  user: null,

  restore: async () => {
    const token = await tokenStorage.read();

    if (!token) {
      set({ status: 'signedOut', token: null, user: null });
      return;
    }

    const cachedUser = await userStorage.read();
    set({
      status: 'signedIn',
      token,
      user: cachedUser ? (JSON.parse(cachedUser) as AuthUser) : null,
    });
  },

  signIn: async (token, user) => {
    set({ status: 'signedIn', token, user });
    await Promise.all([tokenStorage.write(token), userStorage.write(user)]);
  },

  updateUser: async (user) => {
    set({ user });
    if (get().token) await userStorage.write(user);
  },

  signOut: async () => {
    set({ status: 'signedOut', token: null, user: null });
    await Promise.all([tokenStorage.clear(), userStorage.clear()]);
  },
}));
