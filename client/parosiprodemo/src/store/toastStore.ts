import { create } from 'zustand';

export type ToastTone = 'error' | 'success';

interface ToastState {
  message: string | null;
  tone: ToastTone;
  show: (message: string, tone: ToastTone) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  tone: 'error',
  show: (message, tone) => set({ message, tone }),
  hide: () => set({ message: null }),
}));

export function showToast(message: string, tone: ToastTone = 'error'): void {
  useToastStore.getState().show(message, tone);
}
