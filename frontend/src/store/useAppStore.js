// Global UI state store (Zustand). Stub for now — grows as features land.
import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // Placeholder slice so the store is wired and testable from day one.
  ready: false,
  setReady: (ready) => set({ ready }),
}));
