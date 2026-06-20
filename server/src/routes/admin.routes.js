const express = require("express");
const router = express.Router();

const {
  getVolunteers, getVolunteerById, updateVolunteerStatus, deleteVolunteer,
  getTasks, createTask, getTaskById, updateTask, deleteTask, assignVolunteers, reviewSubmission,
  getAllAttendance, markAttendance, updateAttendance,
  issueCertificate, getCertificates, revokeCertificate,
  getDashboardStats,
  getAnnouncements, createAnnouncement, deleteAnnouncement,
} = require("../controllers/admin.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const { validate, createTaskSchema } = require("../utils/validators");

// All admin routes require auth + admin or superadmin role
router.use(protect, authorizeRoles("admin", "superadmin"));

// ── Dashboard ────────────────────────────────────────────────────────────────
router.get("/dashboard/stats", getDashboardStats);

// ── Volunteers ───────────────────────────────────────────────────────────────
router.get("/volunteers", getVolunteers);
router.get("/volunteers/:id", getVolunteerById);
router.patch("/volunteers/:id/status", updateVolunteerStatus);
router.delete("/volunteers/:id", deleteVolunteer); // superadmin only (enforced in controller)

// ── Tasks ─────────────────────────────────────────────────────────────────────
router.get("/tasks", getTasks);
router.post("/tasks", validate(createTaskSchema), createTask);
router.get("/tasks/:id", getTaskById);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);
router.post("/tasks/:id/assign", assignVolunteers);
router.patch("/tasks/:id/submissions/:submissionId", reviewSubmission);

// ── Attendance ────────────────────────────────────────────────────────────────
router.get("/attendance", getAllAttendance);
router.post("/attendance", markAttendance);
router.put("/attendance/:id", updateAttendance);

// ── Certificates ──────────────────────────────────────────────────────────────
router.post("/certificates/issue", issueCertificate);
router.get("/certificates", getCertificates);
router.patch("/certificates/:id/revoke", revokeCertificate);

// ── Announcements ─────────────────────────────────────────────────────────────
router.get("/announcements", getAnnouncements);
router.post("/announcements", createAnnouncement);
router.delete("/announcements/:id", deleteAnnouncement);

module.exports = router;
