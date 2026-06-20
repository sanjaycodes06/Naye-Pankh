# NayePankh Foundation — Volunteer Registration System
## Backend (Node.js + Express + MongoDB Atlas)

### Tech Stack
- Node.js 18+ + Express 4
- MongoDB Atlas + Mongoose 8
- JWT (access token in memory, refresh token in httpOnly cookie with rotation)
- bcryptjs (password hashing, salt rounds 12)
- Cloudinary (file uploads via buffer stream)
- Nodemailer (email: verification, approval, OTP, certificates)
- Multer (in-memory storage, 5MB cap, type whitelist)
- Helmet + express-rate-limit + CORS (security)
- Winston + Morgan (logging)
- Joi (request validation)

---

### Project Structure
```
nayepankh-backend/
├── server.js                  # Entry point — connects DB, starts server
├── src/
│   ├── app.js                 # Express app, middleware stack, route mounting
│   ├── config/
│   │   ├── db.js              # MongoDB Atlas connection with reconnect handling
│   │   ├── cloudinary.js      # uploadToCloudinary / deleteFromCloudinary helpers
│   │   └── email.js           # Nodemailer transporter (verified on startup)
│   ├── models/
│   │   ├── User.model.js      # Volunteer + Admin schema, bcrypt pre-save, comparePassword()
│   │   ├── Task.model.js      # Task + submissions subdocument
│   │   ├── Attendance.model.js# Auto-calculates hoursLogged from checkIn/Out times
│   │   ├── Certificate.model.js # UUID-based verificationCode
│   │   ├── Notification.model.js
│   │   └── Announcement.model.js
│   ├── controllers/
│   │   ├── auth.controller.js # register, verifyEmail, login, refreshToken, logout,
│   │   │                      # forgotPassword, resetPassword, getCurrentUser (NEW)
│   │   ├── volunteer.controller.js # getMyProfile, updateMyProfile, uploadProfilePhoto,
│   │   │                           # getMyTasks, submitTask, getMyAttendance,
│   │   │                           # getMyCertificates, getMyNotifications, getDashboardStats
│   │   ├── admin.controller.js     # Full volunteer/task/attendance/cert/announcement management
│   │   ├── export.controller.js    # CSV exports: volunteers, attendance, certificates, summary
│   │   └── public.controller.js    # Certificate verification (public), public announcements
│   ├── routes/
│   │   ├── auth.routes.js          # /api/auth/*
│   │   ├── volunteer.routes.js     # /api/volunteers/* (role: volunteer only)
│   │   ├── admin.routes.js         # /api/admin/* (role: admin | superadmin)
│   │   ├── export.routes.js        # /api/admin/export/* (mounted BEFORE /api/admin)
│   │   └── public.routes.js        # /api/public/*
│   ├── middleware/
│   │   ├── auth.middleware.js      # protect (JWT verify + fresh DB fetch), requireApproved
│   │   ├── role.middleware.js      # authorizeRoles(...roles) factory
│   │   ├── rateLimiter.js          # authLimiter (10/15m), globalLimiter (100/m), uploadLimiter (5/m)
│   │   ├── upload.middleware.js    # uploadPhoto, uploadDocument, uploadAttachments (Multer)
│   │   ├── errorHandler.js         # Global error handler — Mongoose, JWT, Multer, CastError
│   │   └── notFound.js             # 404 fallback
│   ├── services/
│   │   ├── email.service.js        # sendVerificationEmail, sendApprovalEmail, sendRejectionEmail,
│   │   │                           # sendPasswordResetOTP, sendTaskAssignmentEmail, sendCertificateEmail
│   │   └── notification.service.js # createNotification, broadcastNotification
│   └── utils/
│       ├── jwtHelper.js            # generateAccessToken/RefreshToken, verify*, setRefreshCookie
│       ├── apiResponse.js          # sendSuccess, sendError — standardised response shape
│       ├── validators.js           # Joi schemas: registerSchema, loginSchema, resetPasswordSchema, createTaskSchema
│       ├── generateVolunteerId.js  # Auto-increments NP-YYYY-XXXX
│       ├── csvExport.js            # toCSV(rows, columns) — UTF-8 BOM, RFC 4180 compliant
│       └── logger.js               # Winston (console dev, file prod)
```

---

### API Routes

#### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | Public | Volunteer self-registration |
| GET | `/verify-email/:token` | Public | Email verification |
| POST | `/login` | Public | Returns accessToken + sets refresh cookie |
| POST | `/refresh-token` | Cookie | Silent token rotation |
| POST | `/forgot-password` | Public | Sends OTP to email |
| POST | `/reset-password` | Public | Resets password with OTP |
| GET | `/me` | Any role | Role-agnostic session bootstrap |
| POST | `/logout` | Any role | Clears refresh token |

#### Volunteer (`/api/volunteers`) — role: volunteer only
| Method | Path | Status required | Description |
|--------|------|----------------|-------------|
| GET | `/me` | any | Get own profile |
| PUT | `/me` | any | Update own profile |
| PUT | `/me/photo` | any | Upload profile photo |
| GET | `/me/dashboard` | approved | Dashboard stats |
| GET | `/me/tasks` | approved | Assigned tasks |
| POST | `/me/tasks/:id/submit` | approved | Submit task completion |
| GET | `/me/attendance` | approved | Attendance log |
| GET | `/me/certificates` | approved | Issued certificates |
| GET | `/me/notifications` | any | Notifications |
| PATCH | `/me/notifications/:id/read` | any | Mark as read |

#### Admin (`/api/admin`) — role: admin | superadmin
Volunteers: GET list, GET by id, PATCH status (approve/reject/suspend), DELETE (superadmin only)
Tasks: full CRUD, assign volunteers, review submissions
Attendance: GET list, POST mark, PUT update (with delta hours correction)
Certificates: POST issue, GET list, PATCH revoke
Dashboard: GET stats
Announcements: GET list, POST create, DELETE

#### Export (`/api/admin/export`) — role: admin | superadmin
| GET | `/volunteers` | Filtered volunteer CSV |
| GET | `/attendance` | Attendance CSV |
| GET | `/certificates` | Certificates CSV |
| GET | `/summary` | Per-volunteer summary CSV |

#### Public (`/api/public`)
| GET | `/verify/:code` | Certificate authenticity check |
| GET | `/announcements` | Public announcements |

---

### Setup

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Fill in MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET,
# CLOUDINARY_*, EMAIL_* in .env

# 3. Seed a superadmin directly in MongoDB Atlas:
# {
#   fullName: "Super Admin",
#   email: "admin@nayepankh.org",
#   password: "<bcrypt hash of your password>",
#   role: "superadmin",
#   status: "approved",   ← required
#   emailVerified: true   ← required
# }
# Or use a seed script (see below)

# 4. Run
npm run dev          # development (nodemon)
npm start            # production

# 5. Health check
curl http://localhost:5000/health
```

### Seeding an admin (quick script)
```js
// scripts/seedAdmin.js  (run once with: node scripts/seedAdmin.js)
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User.model");

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const hash = await bcrypt.hash("Admin@1234", 12);
  await User.create({
    fullName: "NayePankh Admin",
    email: "admin@nayepankh.org",
    password: hash,
    role: "superadmin",
    status: "approved",
    emailVerified: true,
  });
  console.log("Admin seeded.");
  process.exit(0);
});
```

---

### Bug fixes applied (review pass)
1. **Admins logged out on refresh** — Added `GET /api/auth/me` (role-agnostic) and updated `AuthContext` to use it instead of the volunteer-only `/volunteers/me` endpoint.
2. **Duplicate response key** — `updateVolunteerStatus` had two `volunteerId` keys; JS silently dropped the `_id`. Fixed to `userId` + `volunteerId`.
3. **Submission double-credit** — `reviewSubmission` now blocks re-review of already-decided submissions with a 409, preventing `$inc` from firing twice.
4. **Attendance edit desync** — `updateAttendance` now computes the hours delta and applies only that to `totalHours`, keeping the running total accurate.
5. **Multer errors returned 500** — `errorHandler` now handles `MulterError` and custom file-type rejections with clear 400 responses.
6. **Route mount order** — `/api/admin/export` now mounted before `/api/admin` (defensive best practice).
