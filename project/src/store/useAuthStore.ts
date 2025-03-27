// @ts-nocheck
import { create } from "zustand";
import { AuthState } from "../types";

export const useThemeStore = create<AuthState>((set) => ({
  isLoginPopup: false,
  setIsLoginPopup: (isLoginPopup: boolean) => set({ isLoginPopup }),

  isSignUpPopup: false,
  setIsSignUpPopup: (isSignUpPopup: boolean) => set({ isSignUpPopup }),
}));
