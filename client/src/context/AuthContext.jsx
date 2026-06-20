import { createContext, useContext, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { authAPI } from "@/api/auth.api";
import api from "@/api/axiosInstance";

const AuthContext = createContext(null);

/**
 * AuthProvider bootstraps the session on mount.
 * It tries a silent token refresh, then fetches the current user via the
 * role-agnostic /auth/me endpoint — this works identically for volunteers,
 * admins, and superadmins, so the session survives a page refresh
 * regardless of role.
 *
 * (Previously this called the volunteer-only /volunteers/me endpoint,
 * which returned 403 for admin accounts and caused them to be silently
 * logged out on every page reload.)
 */
export const AuthProvider = ({ children }) => {
  const { setAuth, logout } = useAuthStore();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Try to get a new access token from the httpOnly refresh cookie.
        // If there's no valid cookie (first visit, expired session), this
        // throws and we fall through to logout() below — that's correct.
        const { data: refreshData } = await api.post("/auth/refresh-token");
        const accessToken = refreshData.data.accessToken;
        useAuthStore.getState().setAccessToken(accessToken);

        // Fetch whoever this token belongs to — works for any role.
        const { data: meData } = await authAPI.getCurrentUser();
        setAuth(meData.data.user, accessToken);
      } catch {
        // No valid session (or it expired) — clear any stale state.
        logout();
      }
    };

    bootstrap();
  }, []);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useAuthStore();

export default AuthContext;
