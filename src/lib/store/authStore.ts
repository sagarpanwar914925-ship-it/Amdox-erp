// src/lib/store/authStore.ts
// Zustand store for authentication state

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { UserWithRole } from "@/lib/auth";

interface AuthState {
  user: UserWithRole | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: UserWithRole | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: false,
        error: null,
        setUser: (user) => set({ user }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        logout: () => set({ user: null, error: null }),
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({ user: state.user }),
      }
    ),
    { name: "AuthStore" }
  )
);
