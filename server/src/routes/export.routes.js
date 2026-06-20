const express = require("express");
const router  = express.Router();

const {
  exportVolunteers,
  exportAttendance,
  exportCertificates,
  exportSummary,
} = require("../controllers/export.controller");

const { protect }        = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// All export routes: admin / superadmin only
router.use(protect, authorizeRoles("admin", "superadmin"));

/**
 * GET /api/admin/export/volunteers
 * ?status=approved&skills=teaching,medical&search=priya&fromDate=2024-01-01&toDate=2024-12-31
 */
router.get("/volunteers",    exportVolunteers);

/**
 * GET /api/admin/export/attendance
 * ?volunteerId=<id>&taskId=<id>&fromDate=2024-01-01&toDate=2024-12-31
 */
router.get("/attendance",    exportAttendance);

/**
 * GET /api/admin/export/certificates
 * ?certificateType=internship&isValid=true&fromDate=2024-01-01&toDate=2024-12-31
 */
router.get("/certificates",  exportCertificates);

/**
 * GET /api/admin/export/summary
 * One row per approved volunteer with hours, tasks, certificate count
 */
router.get("/summary",       exportSummary);

module.exports = router;
