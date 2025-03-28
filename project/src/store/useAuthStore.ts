// @ts-nocheck
import { create } from "zustand";
import { AuthState } from "../types";

export const useAuthStore = create<AuthState>((set) => ({
  isSignInPopup: false,
  setIsSignInPopup: (isSignInPopup: boolean) => set({ isSignInPopup }),
  isSignUpPopup: false,
  setIsSignUpPopup: (isSignUpPopup: boolean) => set({ isSignUpPopup }),
}));
