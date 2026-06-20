import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { PageLoader } from "./Loader";

/**
 * Guards a route by role.
 * - `requiredRole`: "volunteer" | "admin" | "superadmin"
 * - If not authenticated → /login
 * - If wrong role → /unauthorized
 *
 * Volunteer and admin are separate tracks, not a linear hierarchy:
 * an admin account has no volunteerId/totalHours/skills, so letting
 * them into volunteer routes renders broken/empty UI. Only admin →
 * superadmin is treated as nested, matching the backend's
 * authorizeRoles("admin", "superadmin") pattern.
 */
const ProtectedRoute = ({ children, requiredRole = "volunteer" }) => {
  const { user, accessToken, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasAccess =
    requiredRole === "volunteer"
      ? user.role === "volunteer"
      : requiredRole === "admin"
        ? user.role === "admin" || user.role === "superadmin"
        : user.role === "superadmin";

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
