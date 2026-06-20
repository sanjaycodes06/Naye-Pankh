# NayePankh Foundation — Volunteer Registration System
## Frontend (React + Vite + Tailwind CSS)

### Tech Stack
- React 18 + Vite 5
- Tailwind CSS 3 (custom design tokens: forest green, gold, sage, cream, ink)
- React Router v6 (lazy-loaded routes, role-based ProtectedRoute)
- Zustand (global auth store — access token in memory, never localStorage)
- Axios (interceptor-based silent refresh, blob error extraction)
- react-hot-toast (notifications)
- lucide-react (icons)
- Google Fonts: Fraunces (display) + DM Sans (body)

---

### Project Structure
```
nayepankh-frontend/
├── index.html               # Font imports, root div
├── vite.config.js           # Path alias @/ → src/, dev proxy → :5000
├── tailwind.config.js       # Brand tokens: brand (green), earth, ink colors
├── src/
│   ├── main.jsx             # ReactDOM.createRoot, BrowserRouter, Toaster
│   ├── App.jsx              # AuthProvider wrapping AppRouter
│   ├── index.css            # Tailwind layers + .btn-*, .card, .input, .badge classes
│   │
│   ├── api/
│   │   ├── axiosInstance.js # Axios instance — attaches Bearer token, silent refresh on 401
│   │   ├── auth.api.js      # register, verifyEmail, login, logout, forgotPassword,
│   │   │                    # resetPassword, getCurrentUser
│   │   ├── volunteer.api.js # getProfile, updateProfile, uploadPhoto, getDashboard,
│   │   │                    # getTasks, submitTask, getAttendance, getCertificates,
│   │   │                    # getNotifications, markNotificationRead
│   │   └── admin.api.js     # getDashboardStats, full volunteer/task/attendance/cert/
│   │                        # announcement CRUD, all 4 CSV exports (responseType: blob)
│   │
│   ├── store/
│   │   └── authStore.js     # Zustand: user, accessToken (in-memory), isLoading
│   │                        # setAuth, setAccessToken, updateUser, logout
│   │
│   ├── context/
│   │   └── AuthContext.jsx  # Bootstrap: refresh-token → GET /auth/me (role-agnostic)
│   │                        # Works for volunteers AND admins on page refresh
│   │
│   ├── routes/
│   │   └── AppRouter.jsx    # All 26 routes, lazy-loaded, role-gated via ProtectedRoute
│   │
│   ├── layouts/
│   │   ├── PublicLayout.jsx   # Navbar + Outlet + Footer, scroll-to-top on navigate
│   │   ├── VolunteerLayout.jsx# Fixed sidebar (desktop), drawer (mobile)
│   │   └── AdminLayout.jsx    # Same structure, role="admin" sidebar
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx       # Sticky, scroll-aware, avatar dropdown, mobile hamburger
│   │   │   ├── Footer.jsx       # 4-col grid, social links, CTA band
│   │   │   ├── Sidebar.jsx      # Dual-mode (volunteer/admin nav), user card, sign out
│   │   │   ├── ProtectedRoute.jsx # role="volunteer"|"admin"|"superadmin"
│   │   │   │                      # Volunteer and admin are SEPARATE tracks (not linear)
│   │   │   ├── Loader.jsx       # PageLoader (full-screen), Spinner, Skeleton
│   │   │   ├── Modal.jsx        # Escape-to-close, body scroll lock, backdrop click
│   │   │   ├── Pagination.jsx   # Smart page numbers with ellipsis
│   │   │   ├── StatusBadge.jsx  # All statuses: approved/pending/rejected/suspended/etc.
│   │   │   ├── EmptyState.jsx   # Icon + title + description + optional action
│   │   │   ├── PageHeader.jsx   # Title + subtitle + optional right-side actions slot
│   │   │   └── FormField.jsx    # Label + input/select/textarea + inline error
│   │   ├── admin/
│   │   │   ├── StatCard.jsx     # Icon + value + label + optional trend badge
│   │   │   ├── VolunteerRow.jsx # Table row — approve/reject buttons with loading state,
│   │   │   │                    # overflow menu (suspend/reactivate/delete)
│   │   │   └── ConfirmDialog.jsx# Generic confirm modal for destructive actions
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Home.jsx           # Landing: Hero, Stats, About, Benefits, Testimonials,
│   │   │   │                      # Contact form, Footer — animated counter, Devanagari glyph
│   │   │   ├── Login.jsx          # Split-panel, show/hide password, redirect by role
│   │   │   ├── Register.jsx       # 4-step form with visual progress rail
│   │   │   ├── ForgotPassword.jsx # Email → OTP sent state
│   │   │   ├── ResetPassword.jsx  # Email + OTP + new password
│   │   │   ├── VerifyEmail.jsx    # 3 states: loading / success / error
│   │   │   ├── VerifyCertificate.jsx # Public certificate lookup by code
│   │   │   ├── About.jsx          # (stub — ready to fill)
│   │   │   ├── NotFound.jsx       # 404
│   │   │   └── Unauthorized.jsx   # 403
│   │   ├── volunteer/
│   │   │   ├── Dashboard.jsx      # Stats cards, recent tasks, attendance, quick links
│   │   │   │                      # Pending banner shown until admin approves
│   │   │   ├── Profile.jsx        # Hero card, all profile sections, inline photo upload
│   │   │   ├── EditProfile.jsx    # Dirty-state tracking, unsaved-changes bar,
│   │   │   │                      # beforeunload guard, back-button confirm
│   │   │   ├── Tasks.jsx          # (stub — ready to fill)
│   │   │   ├── TaskDetail.jsx     # (stub — ready to fill)
│   │   │   ├── Attendance.jsx     # (stub — ready to fill)
│   │   │   ├── Certificates.jsx   # (stub — ready to fill)
│   │   │   └── Notifications.jsx  # (stub — ready to fill)
│   │   └── admin/
│   │       ├── AdminDashboard.jsx # 4 stat cards, hours banner, recent registrations,
│   │       │                      # quick-action cards, summary CSV export
│   │       ├── Volunteers.jsx     # Table with search/filter/pagination, approve/reject,
│   │       │                      # suspend/reactivate/delete, per-row loading state,
│   │       │                      # CSV export with real error messages
│   │       ├── VolunteerDetail.jsx# (stub — ready to fill)
│   │       ├── Tasks.jsx          # (stub — ready to fill)
│   │       ├── CreateTask.jsx     # (stub — ready to fill)
│   │       ├── TaskDetail.jsx     # (stub — ready to fill)
│   │       ├── Attendance.jsx     # (stub — ready to fill)
│   │       ├── Certificates.jsx   # (stub — ready to fill)
│   │       └── Announcements.jsx  # (stub — ready to fill)
│   │
│   ├── hooks/
│   │   ├── useAuth.js        # Re-exports useAuth from AuthContext
│   │   ├── useForm.js        # values, errors, handleChange, setError, reset
│   │   └── usePageTitle.js   # Sets document.title with brand suffix
│   │
│   └── utils/
│       ├── cn.js             # clsx wrapper
│       ├── formatDate.js     # formatDate, formatDateTime, timeAgo (en-IN locale)
│       └── downloadFile.js   # downloadFile(blob, filename)
│                             # extractBlobErrorMessage(err, fallback) — parses real
│                             # error message from blob-wrapped JSON error responses
```

---

### Setup

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5000/api

# 3. Run (backend must be running first)
npm run dev          # http://localhost:5173

# 4. Build for production
npm run build
npm run preview
```

---

### Auth flow (end-to-end)
```
/register (4 steps) → email verify → /login
Login → POST /auth/login → accessToken (memory) + refreshToken (httpOnly cookie)
Every request → axiosInstance attaches Bearer token
401 response → interceptor calls POST /auth/refresh-token → rotates both tokens silently
Page refresh → AuthProvider calls POST /auth/refresh-token → GET /auth/me → restores session
Logout → POST /auth/logout → clears cookie → Zustand logout()
```

### Role routing
```
volunteer → /volunteer/* (ProtectedRoute role="volunteer" — exact match only)
admin     → /admin/*    (ProtectedRoute role="admin" — allows admin + superadmin)
Both roles redirect to /unauthorized if they try to access the other's routes
```

---

### Bug fixes applied (review pass)
1. **Admins logged out on refresh** — AuthContext now calls GET /auth/me (role-agnostic) instead of the volunteer-only /volunteers/me.
2. **ProtectedRoute hierarchy** — Volunteer and admin are now separate tracks. Admins can no longer access /volunteer/* routes (where they'd see broken empty UI).
3. **toast not imported in Dashboard.jsx** — Would have crashed with ReferenceError on any failed API call. Fixed.
4. **Silent catch blocks** — Profile.jsx, EditProfile.jsx, Dashboard.jsx now surface real backend error messages.
5. **CSV export error shows [object Blob]** — extractBlobErrorMessage() reads the blob as text and parses the real message.
6. **Per-row loading state** — Approve/Reactivate buttons are disabled with a spinner while the request is in flight, preventing double-submission.
7. **Double-fetch on filter change** — Page reset now uses functional setState to avoid triggering a redundant fetch when already on page 1.
8. **Unsaved changes unprotected** — EditProfile now has a beforeunload browser warning + in-app confirm on the back arrow.
