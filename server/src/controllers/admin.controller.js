const User = require("../models/User.model");
const Task = require("../models/Task.model");
const Attendance = require("../models/Attendance.model");
const Certificate = require("../models/Certificate.model");
const Announcement = require("../models/Announcement.model");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const generateVolunteerId = require("../utils/generateVolunteerId");
const { sendApprovalEmail, sendRejectionEmail, sendTaskAssignmentEmail, sendCertificateEmail } = require("../services/email.service");
const { createNotification, broadcastNotification } = require("../services/notification.service");

// ─── VOLUNTEER MANAGEMENT ────────────────────────────────────────────────────

const getVolunteers = async (req, res, next) => {
  try {
    const { status, search, skills, page = 1, limit = 20 } = req.query;
    const filter = { role: "volunteer" };
    if (status) filter.status = status;
    if (skills) filter.skills = { $in: skills.split(",") };
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { volunteerId: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [volunteers, total] = await Promise.all([
      User.find(filter)
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, "Volunteers retrieved.", {
      volunteers,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

const getVolunteerById = async (req, res, next) => {
  try {
    const volunteer = await User.findOne({ _id: req.params.id, role: "volunteer" })
      .select("-password -refreshToken")
      .populate("approvedBy", "fullName email");

    if (!volunteer) return sendError(res, 404, "Volunteer not found.");

    const [taskCount, totalHoursAgg] = await Promise.all([
      Task.countDocuments({ assignedTo: volunteer._id }),
      Attendance.aggregate([
        { $match: { volunteerId: volunteer._id } },
        { $group: { _id: null, total: { $sum: "$hoursLogged" } } },
      ]),
    ]);

    return sendSuccess(res, 200, "Volunteer retrieved.", {
      volunteer,
      taskCount,
      totalHoursFromAttendance: totalHoursAgg[0]?.total || 0,
    });
  } catch (err) {
    next(err);
  }
};

const updateVolunteerStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const validStatuses = ["approved", "rejected", "suspended", "pending"];

    if (!validStatuses.includes(status)) {
      return sendError(res, 400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const volunteer = await User.findOne({ _id: req.params.id, role: "volunteer" });
    if (!volunteer) return sendError(res, 404, "Volunteer not found.");

    volunteer.status = status;

    if (status === "approved" && !volunteer.volunteerId) {
      volunteer.volunteerId = await generateVolunteerId();
      volunteer.approvedAt = new Date();
      volunteer.approvedBy = req.user._id;
      sendApprovalEmail(volunteer.email, volunteer.fullName, volunteer.volunteerId).catch(() => {});
      createNotification({
        recipientId: volunteer._id,
        type: "status_update",
        title: "Application Approved!",
        message: `Congratulations! Your volunteer application has been approved. Your ID is ${volunteer.volunteerId}.`,
        link: "/volunteer/dashboard",
      });
    }

    if (status === "rejected") {
      sendRejectionEmail(volunteer.email, volunteer.fullName, reason).catch(() => {});
      createNotification({
        recipientId: volunteer._id,
        type: "status_update",
        title: "Application Update",
        message: reason || "Your volunteer application was not approved at this time.",
      });
    }

    await volunteer.save();
    return sendSuccess(res, 200, `Volunteer status updated to "${status}".`, {
      userId: volunteer._id,
      status: volunteer.status,
      volunteerId: volunteer.volunteerId,
    });
  } catch (err) {
    next(err);
  }
};

const deleteVolunteer = async (req, res, next) => {
  try {
    if (req.user.role !== "superadmin") {
      return sendError(res, 403, "Only superadmins can permanently delete volunteers.");
    }
    const volunteer = await User.findOneAndDelete({ _id: req.params.id, role: "volunteer" });
    if (!volunteer) return sendError(res, 404, "Volunteer not found.");
    return sendSuccess(res, 200, "Volunteer permanently deleted.");
  } catch (err) {
    next(err);
  }
};

// ─── TASK MANAGEMENT ─────────────────────────────────────────────────────────

const getTasks = async (req, res, next) => {
  try {
    const { status, category, priority, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate("createdBy", "fullName")
        .populate("assignedTo", "fullName email volunteerId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, "Tasks retrieved.", {
      tasks,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    return sendSuccess(res, 201, "Task created successfully.", { task });
  } catch (err) {
    next(err);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "fullName email")
      .populate("assignedTo", "fullName email volunteerId profilePhoto")
      .populate("submissions.volunteerId", "fullName email volunteerId")
      .populate("submissions.reviewedBy", "fullName");

    if (!task) return sendError(res, 404, "Task not found.");
    return sendSuccess(res, 200, "Task retrieved.", { task });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!task) return sendError(res, 404, "Task not found.");
    return sendSuccess(res, 200, "Task updated.", { task });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return sendError(res, 404, "Task not found.");
    return sendSuccess(res, 200, "Task deleted.");
  } catch (err) {
    next(err);
  }
};

const assignVolunteers = async (req, res, next) => {
  try {
    const { volunteerIds } = req.body;
    if (!Array.isArray(volunteerIds) || volunteerIds.length === 0) {
      return sendError(res, 400, "volunteerIds must be a non-empty array.");
    }

    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, "Task not found.");

    // Merge without duplicates
    const existing = task.assignedTo.map((id) => id.toString());
    const newIds = volunteerIds.filter((id) => !existing.includes(id));
    task.assignedTo.push(...newIds);
    task.currentVolunteers = task.assignedTo.length;
    await task.save();

    // Notify newly assigned volunteers
    for (const vid of newIds) {
      const volunteer = await User.findById(vid).select("email fullName");
      if (volunteer) {
        sendTaskAssignmentEmail(volunteer.email, volunteer.fullName, task.title, task.deadline).catch(() => {});
        createNotification({
          recipientId: vid,
          type: "task_assigned",
          title: "New Task Assigned",
          message: `You have been assigned: "${task.title}"`,
          link: `/volunteer/tasks/${task._id}`,
        });
      }
    }

    return sendSuccess(res, 200, `${newIds.length} volunteer(s) assigned.`, { task });
  } catch (err) {
    next(err);
  }
};

const reviewSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { status, reviewNotes, hoursLogged } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return sendError(res, 400, "Submission status must be 'approved' or 'rejected'.");
    }

    const task = await Task.findById(req.params.id);
    if (!task) return sendError(res, 404, "Task not found.");

    const submission = task.submissions.id(submissionId);
    if (!submission) return sendError(res, 404, "Submission not found.");

    // Guard against double-crediting: once a submission has been approved
    // or rejected, it's a final decision. Re-calling this endpoint (double
    // click, network retry, or an admin correcting a typo'd hours value)
    // must not $inc the volunteer's totalHours/tasksCompleted a second time.
    if (submission.status === "approved" || submission.status === "rejected") {
      return sendError(
        res, 409,
        `This submission was already ${submission.status} on ${submission.reviewedAt?.toLocaleDateString?.() || "a previous date"}. ` +
        "To correct it, adjust the volunteer's hours directly or contact a superadmin."
      );
    }

    submission.status = status;
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    submission.reviewNotes = reviewNotes || "";
    if (status === "approved" && hoursLogged) submission.hoursLogged = hoursLogged;

    await task.save();

    // Credit hours to volunteer on approval
    if (status === "approved" && hoursLogged) {
      await User.findByIdAndUpdate(submission.volunteerId, {
        $inc: { totalHours: hoursLogged, tasksCompleted: 1 },
      });
    }

    createNotification({
      recipientId: submission.volunteerId,
      type: status === "approved" ? "task_approved" : "task_rejected",
      title: `Task Submission ${status === "approved" ? "Approved" : "Rejected"}`,
      message: reviewNotes || `Your submission for "${task.title}" has been ${status}.`,
      link: `/volunteer/tasks/${task._id}`,
    });

    return sendSuccess(res, 200, `Submission ${status}.`);
  } catch (err) {
    next(err);
  }
};

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────

const getAllAttendance = async (req, res, next) => {
  try {
    const { volunteerId, taskId, date, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (volunteerId) filter.volunteerId = volunteerId;
    if (taskId) filter.taskId = taskId;
    if (date) {
      const d = new Date(date);
      filter.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .populate("volunteerId", "fullName email volunteerId")
        .populate("taskId", "title")
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Attendance.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, "Attendance records retrieved.", {
      records,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.create({ ...req.body, markedBy: req.user._id });

    // Credit hours to volunteer
    if (record.hoursLogged > 0) {
      await User.findByIdAndUpdate(record.volunteerId, {
        $inc: { totalHours: record.hoursLogged },
      });
    }

    createNotification({
      recipientId: record.volunteerId,
      type: "attendance_marked",
      title: "Attendance Recorded",
      message: `Your attendance for "${record.eventName}" has been marked as ${record.status}.`,
      link: "/volunteer/attendance",
    });

    return sendSuccess(res, 201, "Attendance marked.", { record });
  } catch (err) {
    next(err);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const existing = await Attendance.findById(req.params.id);
    if (!existing) return sendError(res, 404, "Attendance record not found.");

    const previousHours = existing.hoursLogged || 0;

    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // Keep the volunteer's totalHours in sync: apply only the delta between
    // the old and new hoursLogged, not the full new value, since the
    // original amount was already credited when this record was created.
    const newHours = record.hoursLogged || 0;
    const delta = newHours - previousHours;
    if (delta !== 0) {
      await User.findByIdAndUpdate(record.volunteerId, { $inc: { totalHours: delta } });
    }

    return sendSuccess(res, 200, "Attendance updated.", { record });
  } catch (err) {
    next(err);
  }
};

// ─── CERTIFICATES ─────────────────────────────────────────────────────────────

const issueCertificate = async (req, res, next) => {
  try {
    const { volunteerId, certificateType, issuedFor, totalHours } = req.body;

    const volunteer = await User.findOne({ _id: volunteerId, role: "volunteer" });
    if (!volunteer) return sendError(res, 404, "Volunteer not found.");

    const cert = await Certificate.create({
      volunteerId,
      certificateType,
      issuedFor,
      totalHours,
      issuedBy: req.user._id,
    });

    sendCertificateEmail(volunteer.email, volunteer.fullName, certificateType, cert.certificateUrl).catch(() => {});
    createNotification({
      recipientId: volunteerId,
      type: "certificate_issued",
      title: "Certificate Issued",
      message: `Your ${certificateType} certificate has been issued for "${issuedFor}".`,
      link: "/volunteer/certificates",
    });

    return sendSuccess(res, 201, "Certificate issued.", { certificate: cert });
  } catch (err) {
    next(err);
  }
};

const getCertificates = async (req, res, next) => {
  try {
    const certs = await Certificate.find()
      .populate("volunteerId", "fullName email volunteerId")
      .populate("issuedBy", "fullName")
      .sort({ issuedAt: -1 });
    return sendSuccess(res, 200, "Certificates retrieved.", { certificates: certs });
  } catch (err) {
    next(err);
  }
};

const revokeCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findByIdAndUpdate(req.params.id, { isValid: false }, { new: true });
    if (!cert) return sendError(res, 404, "Certificate not found.");
    return sendSuccess(res, 200, "Certificate revoked.");
  } catch (err) {
    next(err);
  }
};

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalVolunteers, pendingApprovals, activeTasks, totalCertificates, recentRegistrations] =
      await Promise.all([
        User.countDocuments({ role: "volunteer", status: "approved" }),
        User.countDocuments({ role: "volunteer", status: "pending" }),
        Task.countDocuments({ status: { $in: ["open", "in_progress"] } }),
        Certificate.countDocuments({ isValid: true }),
        User.find({ role: "volunteer" })
          .select("fullName email status createdAt")
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    const totalHoursAgg = await User.aggregate([
      { $match: { role: "volunteer", status: "approved" } },
      { $group: { _id: null, total: { $sum: "$totalHours" } } },
    ]);

    return sendSuccess(res, 200, "Dashboard stats retrieved.", {
      totalVolunteers,
      pendingApprovals,
      activeTasks,
      totalCertificates,
      totalHoursContributed: totalHoursAgg[0]?.total || 0,
      recentRegistrations,
    });
  } catch (err) {
    next(err);
  }
};

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────

const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate("postedBy", "fullName")
      .sort({ isPinned: -1, createdAt: -1 });
    return sendSuccess(res, 200, "Announcements retrieved.", { announcements });
  } catch (err) {
    next(err);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.create({ ...req.body, postedBy: req.user._id });

    // Notify target audience
    const audienceFilter = { role: "volunteer" };
    if (req.body.targetAudience === "approved_volunteers") audienceFilter.status = "approved";
    if (req.body.targetAudience === "pending") audienceFilter.status = "pending";

    const recipients = await User.find(audienceFilter).select("_id");
    const ids = recipients.map((r) => r._id);

    broadcastNotification(ids, {
      type: "announcement",
      title: announcement.title,
      message: announcement.content.substring(0, 150),
      link: "/volunteer/announcements",
    });

    return sendSuccess(res, 201, "Announcement created.", { announcement });
  } catch (err) {
    next(err);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const ann = await Announcement.findByIdAndDelete(req.params.id);
    if (!ann) return sendError(res, 404, "Announcement not found.");
    return sendSuccess(res, 200, "Announcement deleted.");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVolunteers, getVolunteerById, updateVolunteerStatus, deleteVolunteer,
  getTasks, createTask, getTaskById, updateTask, deleteTask, assignVolunteers, reviewSubmission,
  getAllAttendance, markAttendance, updateAttendance,
  issueCertificate, getCertificates, revokeCertificate,
  getDashboardStats,
  getAnnouncements, createAnnouncement, deleteAnnouncement,
};
