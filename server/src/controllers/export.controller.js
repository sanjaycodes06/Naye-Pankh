const User = require("../models/User.model");
const Attendance = require("../models/Attendance.model");
const Certificate = require("../models/Certificate.model");
const { toCSV } = require("../utils/csvExport");
const logger = require("../utils/logger");

// ── Column definitions ────────────────────────────────────────────────────────

const VOLUNTEER_COLUMNS = [
  { label: "Volunteer ID",    value: (r) => r.volunteerId || "" },
  { label: "Full Name",       value: (r) => r.fullName },
  { label: "Email",           value: (r) => r.email },
  { label: "Phone",           value: (r) => r.phone || "" },
  { label: "Gender",          value: (r) => r.gender || "" },
  { label: "Date of Birth",   value: (r) => r.dateOfBirth ? new Date(r.dateOfBirth).toLocaleDateString("en-IN") : "" },
  { label: "City",            value: (r) => r.city || "" },
  { label: "State",           value: (r) => r.state || "" },
  { label: "Education",       value: (r) => r.education || "" },
  { label: "Occupation",      value: (r) => r.occupation || "" },
  { label: "Skills",          value: (r) => (r.skills || []).join("; ") },
  { label: "Languages",       value: (r) => (r.languages || []).join("; ") },
  { label: "Areas of Interest", value: (r) => (r.areasOfInterest || []).join("; ") },
  { label: "Availability - Weekdays", value: (r) => r.availability?.weekdays ? "Yes" : "No" },
  { label: "Availability - Weekends", value: (r) => r.availability?.weekends ? "Yes" : "No" },
  { label: "Availability - Mornings", value: (r) => r.availability?.mornings ? "Yes" : "No" },
  { label: "Availability - Evenings", value: (r) => r.availability?.evenings ? "Yes" : "No" },
  { label: "Emergency Contact Name",  value: (r) => r.emergencyContact?.name || "" },
  { label: "Emergency Contact Phone", value: (r) => r.emergencyContact?.phone || "" },
  { label: "Emergency Contact Relation", value: (r) => r.emergencyContact?.relation || "" },
  { label: "Status",          value: (r) => r.status },
  { label: "Email Verified",  value: (r) => r.emailVerified ? "Yes" : "No" },
  { label: "Total Hours",     value: (r) => r.totalHours ?? 0 },
  { label: "Tasks Completed", value: (r) => r.tasksCompleted ?? 0 },
  { label: "Joined At",       value: (r) => new Date(r.joinedAt).toLocaleDateString("en-IN") },
  { label: "Approved At",     value: (r) => r.approvedAt ? new Date(r.approvedAt).toLocaleDateString("en-IN") : "" },
];

const ATTENDANCE_COLUMNS = [
  { label: "Volunteer ID",   value: (r) => r.volunteerId?.volunteerId || "" },
  { label: "Volunteer Name", value: (r) => r.volunteerId?.fullName || "" },
  { label: "Event Name",     value: (r) => r.eventName },
  { label: "Task Title",     value: (r) => r.taskId?.title || "—" },
  { label: "Date",           value: (r) => new Date(r.date).toLocaleDateString("en-IN") },
  { label: "Check In",       value: (r) => r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString("en-IN") : "" },
  { label: "Check Out",      value: (r) => r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString("en-IN") : "" },
  { label: "Hours Logged",   value: (r) => r.hoursLogged ?? 0 },
  { label: "Status",         value: (r) => r.status },
  { label: "Notes",          value: (r) => r.notes || "" },
  { label: "Marked By",      value: (r) => r.markedBy?.fullName || "" },
];

const CERTIFICATE_COLUMNS = [
  { label: "Verification Code", value: (r) => r.verificationCode },
  { label: "Volunteer ID",      value: (r) => r.volunteerId?.volunteerId || "" },
  { label: "Volunteer Name",    value: (r) => r.volunteerId?.fullName || "" },
  { label: "Volunteer Email",   value: (r) => r.volunteerId?.email || "" },
  { label: "Certificate Type",  value: (r) => r.certificateType },
  { label: "Issued For",        value: (r) => r.issuedFor },
  { label: "Total Hours",       value: (r) => r.totalHours ?? 0 },
  { label: "Issued At",         value: (r) => new Date(r.issuedAt).toLocaleDateString("en-IN") },
  { label: "Issued By",         value: (r) => r.issuedBy?.fullName || "" },
  { label: "Valid",             value: (r) => r.isValid ? "Yes" : "No" },
  { label: "Certificate URL",   value: (r) => r.certificateUrl || "" },
];

// ── Helper: set download headers ──────────────────────────────────────────────
const sendCSV = (res, filename, csvString) => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Cache-Control", "no-cache");
  // BOM for correct Excel rendering of UTF-8
  res.send("\uFEFF" + csvString);
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/admin/export/volunteers
 * Query params: status, skills, search, fromDate, toDate
 * Streams all matching volunteers as a CSV download.
 */
const exportVolunteers = async (req, res, next) => {
  try {
    const { status, skills, search, fromDate, toDate } = req.query;

    const filter = { role: "volunteer" };
    if (status) filter.status = status;
    if (skills) filter.skills = { $in: skills.split(",").map((s) => s.trim()) };
    if (search) {
      filter.$or = [
        { fullName:    { $regex: search, $options: "i" } },
        { email:       { $regex: search, $options: "i" } },
        { city:        { $regex: search, $options: "i" } },
        { volunteerId: { $regex: search, $options: "i" } },
      ];
    }
    if (fromDate || toDate) {
      filter.joinedAt = {};
      if (fromDate) filter.joinedAt.$gte = new Date(fromDate);
      if (toDate)   filter.joinedAt.$lte = new Date(toDate);
    }

    const volunteers = await User.find(filter)
      .select("-password -refreshToken -emailVerificationToken -passwordResetOTP")
      .lean();

    if (volunteers.length === 0) {
      return res.status(404).json({ success: false, message: "No volunteers found matching the filters." });
    }

    const timestamp = new Date().toISOString().split("T")[0];
    const filename  = `volunteers_${status || "all"}_${timestamp}.csv`;
    const csv       = toCSV(volunteers, VOLUNTEER_COLUMNS);

    logger.info(`CSV export: ${volunteers.length} volunteers by admin ${req.user._id}`);
    sendCSV(res, filename, csv);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/export/attendance
 * Query params: volunteerId, taskId, fromDate, toDate
 */
const exportAttendance = async (req, res, next) => {
  try {
    const { volunteerId, taskId, fromDate, toDate } = req.query;

    const filter = {};
    if (volunteerId) filter.volunteerId = volunteerId;
    if (taskId)      filter.taskId = taskId;
    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.$gte = new Date(fromDate);
      if (toDate)   filter.date.$lte = new Date(toDate);
    }

    const records = await Attendance.find(filter)
      .populate("volunteerId", "fullName volunteerId")
      .populate("taskId", "title")
      .populate("markedBy", "fullName")
      .lean();

    if (records.length === 0) {
      return res.status(404).json({ success: false, message: "No attendance records found." });
    }

    const timestamp = new Date().toISOString().split("T")[0];
    const csv       = toCSV(records, ATTENDANCE_COLUMNS);

    logger.info(`CSV export: ${records.length} attendance records by admin ${req.user._id}`);
    sendCSV(res, `attendance_${timestamp}.csv`, csv);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/export/certificates
 * Query params: certificateType, isValid, fromDate, toDate
 */
const exportCertificates = async (req, res, next) => {
  try {
    const { certificateType, isValid, fromDate, toDate } = req.query;

    const filter = {};
    if (certificateType) filter.certificateType = certificateType;
    if (isValid !== undefined) filter.isValid = isValid === "true";
    if (fromDate || toDate) {
      filter.issuedAt = {};
      if (fromDate) filter.issuedAt.$gte = new Date(fromDate);
      if (toDate)   filter.issuedAt.$lte = new Date(toDate);
    }

    const certs = await Certificate.find(filter)
      .populate("volunteerId", "fullName email volunteerId")
      .populate("issuedBy", "fullName")
      .lean();

    if (certs.length === 0) {
      return res.status(404).json({ success: false, message: "No certificates found." });
    }

    const timestamp = new Date().toISOString().split("T")[0];
    const csv       = toCSV(certs, CERTIFICATE_COLUMNS);

    logger.info(`CSV export: ${certs.length} certificates by admin ${req.user._id}`);
    sendCSV(res, `certificates_${timestamp}.csv`, csv);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/export/summary
 * A single combined summary sheet: one row per approved volunteer
 * with their hours, tasks completed, and certificate count.
 */
const exportSummary = async (req, res, next) => {
  try {
    const volunteers = await User.find({ role: "volunteer", status: "approved" })
      .select("fullName email volunteerId city skills totalHours tasksCompleted joinedAt approvedAt")
      .lean();

    // Attach certificate count per volunteer
    const certCounts = await Certificate.aggregate([
      { $match: { isValid: true } },
      { $group: { _id: "$volunteerId", count: { $sum: 1 } } },
    ]);
    const certMap = Object.fromEntries(certCounts.map((c) => [c._id.toString(), c.count]));

    const SUMMARY_COLUMNS = [
      { label: "Volunteer ID",       value: (r) => r.volunteerId || "" },
      { label: "Full Name",          value: (r) => r.fullName },
      { label: "Email",              value: (r) => r.email },
      { label: "City",               value: (r) => r.city || "" },
      { label: "Skills",             value: (r) => (r.skills || []).join("; ") },
      { label: "Total Hours",        value: (r) => r.totalHours ?? 0 },
      { label: "Tasks Completed",    value: (r) => r.tasksCompleted ?? 0 },
      { label: "Certificates Issued",value: (r) => certMap[r._id.toString()] ?? 0 },
      { label: "Joined At",          value: (r) => new Date(r.joinedAt).toLocaleDateString("en-IN") },
      { label: "Approved At",        value: (r) => r.approvedAt ? new Date(r.approvedAt).toLocaleDateString("en-IN") : "" },
    ];

    const timestamp = new Date().toISOString().split("T")[0];
    const csv       = toCSV(volunteers, SUMMARY_COLUMNS);

    logger.info(`CSV summary export: ${volunteers.length} rows by admin ${req.user._id}`);
    sendCSV(res, `volunteer_summary_${timestamp}.csv`, csv);
  } catch (err) {
    next(err);
  }
};

module.exports = { exportVolunteers, exportAttendance, exportCertificates, exportSummary };
