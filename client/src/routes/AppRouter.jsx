import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout   from "@/layouts/PublicLayout";
import VolunteerLayout from "@/layouts/VolunteerLayout";
import AdminLayout    from "@/layouts/AdminLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { PageLoader } from "@/components/common/Loader";

// ── Lazy-load every page (zero bundle cost until route is visited) ──────────

// Public pages
const Home               = lazy(() => import("@/pages/public/Home"));
const About              = lazy(() => import("@/pages/public/About"));
const Register           = lazy(() => import("@/pages/public/Register"));
const Login              = lazy(() => import("@/pages/public/Login"));
const VerifyEmail        = lazy(() => import("@/pages/public/VerifyEmail"));
const ForgotPassword     = lazy(() => import("@/pages/public/ForgotPassword"));
const ResetPassword      = lazy(() => import("@/pages/public/ResetPassword"));
const VerifyCertificate  = lazy(() => import("@/pages/public/VerifyCertificate"));
const Unauthorized       = lazy(() => import("@/pages/public/Unauthorized"));
const NotFound           = lazy(() => import("@/pages/public/NotFound"));

// Volunteer pages
const VolunteerDashboard    = lazy(() => import("@/pages/volunteer/Dashboard"));
const VolunteerProfile      = lazy(() => import("@/pages/volunteer/Profile"));
const VolunteerTasks        = lazy(() => import("@/pages/volunteer/Tasks"));
const VolunteerTaskDetail   = lazy(() => import("@/pages/volunteer/TaskDetail"));
const VolunteerAttendance   = lazy(() => import("@/pages/volunteer/Attendance"));
const VolunteerCertificates = lazy(() => import("@/pages/volunteer/Certificates"));
const VolunteerNotifications= lazy(() => import("@/pages/volunteer/Notifications"));
const VolunteerEditProfile  = lazy(() => import("@/pages/volunteer/EditProfile"));

// Admin pages
const AdminDashboard      = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminVolunteers     = lazy(() => import("@/pages/admin/Volunteers"));
const AdminVolunteerDetail= lazy(() => import("@/pages/admin/VolunteerDetail"));
const AdminTasks          = lazy(() => import("@/pages/admin/Tasks"));
const AdminCreateTask     = lazy(() => import("@/pages/admin/CreateTask"));
const AdminTaskDetail     = lazy(() => import("@/pages/admin/TaskDetail"));
const AdminAttendance     = lazy(() => import("@/pages/admin/Attendance"));
const AdminCertificates   = lazy(() => import("@/pages/admin/Certificates"));
const AdminAnnouncements  = lazy(() => import("@/pages/admin/Announcements"));

// ── Suspense wrapper ──────────────────────────────────────────────────────────
const Lazy = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

// ── Router ────────────────────────────────────────────────────────────────────
const AppRouter = () => (
  <Routes>

    {/* ── Public routes ────────────────────────────────────────────────────── */}
    <Route element={<PublicLayout />}>
      <Route index                           element={<Lazy><Home /></Lazy>} />
      <Route path="about"                    element={<Lazy><About /></Lazy>} />
      <Route path="register"                 element={<Lazy><Register /></Lazy>} />
      <Route path="login"                    element={<Lazy><Login /></Lazy>} />
      <Route path="verify-email"             element={<Lazy><VerifyEmail /></Lazy>} />
      <Route path="forgot-password"          element={<Lazy><ForgotPassword /></Lazy>} />
      <Route path="reset-password"           element={<Lazy><ResetPassword /></Lazy>} />
      <Route path="verify/:code"             element={<Lazy><VerifyCertificate /></Lazy>} />
      <Route path="unauthorized"             element={<Lazy><Unauthorized /></Lazy>} />
      <Route path="*"                        element={<Lazy><NotFound /></Lazy>} />
    </Route>

    {/* ── Volunteer routes (auth required, any status) ──────────────────────── */}
    <Route
      element={
        <ProtectedRoute requiredRole="volunteer">
          <VolunteerLayout />
        </ProtectedRoute>
      }
    >
      <Route path="volunteer">
        <Route index                         element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"              element={<Lazy><VolunteerDashboard /></Lazy>} />
        <Route path="profile"                element={<Lazy><VolunteerProfile /></Lazy>} />
        <Route path="tasks"                  element={<Lazy><VolunteerTasks /></Lazy>} />
        <Route path="tasks/:id"              element={<Lazy><VolunteerTaskDetail /></Lazy>} />
        <Route path="attendance"             element={<Lazy><VolunteerAttendance /></Lazy>} />
        <Route path="certificates"           element={<Lazy><VolunteerCertificates /></Lazy>} />
        <Route path="notifications"          element={<Lazy><VolunteerNotifications /></Lazy>} />
        <Route path="profile/edit"           element={<Lazy><VolunteerEditProfile /></Lazy>} />
      </Route>
    </Route>

    {/* ── Admin routes (admin or superadmin only) ───────────────────────────── */}
    <Route
      element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route path="admin">
        <Route index                         element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"              element={<Lazy><AdminDashboard /></Lazy>} />
        <Route path="volunteers"             element={<Lazy><AdminVolunteers /></Lazy>} />
        <Route path="volunteers/:id"         element={<Lazy><AdminVolunteerDetail /></Lazy>} />
        <Route path="tasks"                  element={<Lazy><AdminTasks /></Lazy>} />
        <Route path="tasks/new"              element={<Lazy><AdminCreateTask /></Lazy>} />
        <Route path="tasks/:id"              element={<Lazy><AdminTaskDetail /></Lazy>} />
        <Route path="attendance"             element={<Lazy><AdminAttendance /></Lazy>} />
        <Route path="certificates"           element={<Lazy><AdminCertificates /></Lazy>} />
        <Route path="announcements"          element={<Lazy><AdminAnnouncements /></Lazy>} />
      </Route>
    </Route>

  </Routes>
);

export default AppRouter;
