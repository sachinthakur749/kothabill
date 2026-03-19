// src/store/authStore.ts
// Global auth state using Zustand

import { create } from 'zustand';
import { KothaBillUser } from '@/types';

interface AuthState {
  user:        KothaBillUser | null;
  isLoading:   boolean;
  isLoggedIn:  boolean;

  setUser:     (user: KothaBillUser | null) => void;
  setLoading:  (loading: boolean) => void;
  logout:      () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:       null,
  isLoading:  true,   // true on startup while we check Firebase auth state
  isLoggedIn: false,

  setUser: (user) =>
    set({ user, isLoggedIn: !!user, isLoading: false }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  logout: () =>
    set({ user: null, isLoggedIn: false, isLoading: false }),
}));
