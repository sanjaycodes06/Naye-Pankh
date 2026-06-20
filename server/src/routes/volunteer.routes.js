const express = require("express");
const router = express.Router();

const {
  getMyProfile, updateMyProfile, uploadProfilePhoto,
  getMyTasks, submitTask,
  getMyAttendance, getMyCertificates,
  getMyNotifications, markNotificationRead,
  getDashboardStats,
} = require("../controllers/volunteer.controller");
const { protect, requireApproved } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const { uploadPhoto, uploadDocument } = require("../middleware/upload.middleware");
const { uploadLimiter } = require("../middleware/rateLimiter");

// All volunteer routes require auth + volunteer role
router.use(protect, authorizeRoles("volunteer"));

router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);
router.put("/me/photo", uploadLimiter, uploadPhoto, uploadProfilePhoto);

// Dashboard & activity — approved only
router.get("/me/dashboard", requireApproved, getDashboardStats);
router.get("/me/tasks", requireApproved, getMyTasks);
router.post("/me/tasks/:id/submit", requireApproved, uploadDocument, submitTask);
router.get("/me/attendance", requireApproved, getMyAttendance);
router.get("/me/certificates", requireApproved, getMyCertificates);

// Notifications available to all volunteers (pending too)
router.get("/me/notifications", getMyNotifications);
router.patch("/me/notifications/:id/read", markNotificationRead);

module.exports = router;
