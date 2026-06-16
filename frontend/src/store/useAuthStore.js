// Authentication state. `status` is 'loading' until the initial silent refresh
// resolves, then 'authenticated' or 'anonymous'.
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  status: 'loading',
  setSession: (user) => set({ user, isAuthenticated: true, status: 'authenticated' }),
  clearSession: () => set({ user: null, isAuthenticated: false, status: 'anonymous' }),
}));
