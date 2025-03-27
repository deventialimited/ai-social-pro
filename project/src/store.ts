import { create } from 'zustand';
import { ThemeState } from './types';

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  setIsDark: (isDark: boolean) => set({ isDark }),
  toggle: () => set((state) => ({ isDark: !state.isDark })),
}));