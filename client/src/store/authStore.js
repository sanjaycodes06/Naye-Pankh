import { create } from "zustand";

/**
 * Global auth state via Zustand.
 * accessToken lives in memory (never localStorage) for XSS safety.
 * refreshToken lives in an httpOnly cookie managed by the backend.
 */
export const useAuthStore = create((set, get) => ({
  user:        null,
  accessToken: null,
  isLoading:   true,   // true on first mount until /me check resolves

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isLoading: false }),

  setAccessToken: (accessToken) =>
    set({ accessToken }),

  updateUser: (partial) =>
    set((state) => ({ user: { ...state.user, ...partial } })),

  logout: () =>
    set({ user: null, accessToken: null, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  // Convenience selectors
  isAuthenticated: () => !!get().accessToken,
  isAdmin:         () => ["admin", "superadmin"].includes(get().user?.role),
  isSuperAdmin:    () => get().user?.role === "superadmin",
  isApproved:      () => get().user?.status === "approved",
}));
