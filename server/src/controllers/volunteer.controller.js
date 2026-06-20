const User = require("../models/User.model");
const Task = require("../models/Task.model");
const Attendance = require("../models/Attendance.model");
const Certificate = require("../models/Certificate.model");
const Notification = require("../models/Notification.model");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const { uploadToCloudinary } = require("../config/cloudinary");

// ── Get My Profile ────────────────────────────────────────────────────────────
const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    return sendSuccess(res, 200, "Profile retrieved.", { user });
  } catch (err) {
    next(err);
  }
};

// ── Update My Profile ─────────────────────────────────────────────────────────
const updateMyProfile = async (req, res, next) => {
  try {
    // Fields a volunteer cannot self-update
    const forbidden = ["role", "status", "totalHours", "tasksCompleted", "volunteerId", "approvedBy", "email"];
    forbidden.forEach((f) => delete req.body[f]);

    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password -refreshToken");

    return sendSuccess(res, 200, "Profile updated.", { user });
  } catch (err) {
    next(err);
  }
};

// ── Upload Profile Photo ──────────────────────────────────────────────────────
const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 400, "No photo uploaded.");

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `nayepankh/profiles/${req.user._id}`,
      public_id: "avatar",
      overwrite: true,
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    });

    await User.findByIdAndUpdate(req.user._id, { profilePhoto: result.secure_url });

    return sendSuccess(res, 200, "Profile photo updated.", { photoUrl: result.secure_url });
  } catch (err) {
    next(err);
  }
};

// ── Get My Tasks ──────────────────────────────────────────────────────────────
const getMyTasks = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { assignedTo: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate("createdBy", "fullName email")
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

// ── Submit Task Completion ────────────────────────────────────────────────────
const submitTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const task = await Task.findOne({ _id: id, assignedTo: req.user._id });
    if (!task) return sendError(res, 404, "Task not found or not assigned to you.");

    const alreadySubmitted = task.submissions.find(
      (s) => s.volunteerId.toString() === req.user._id.toString() && s.status !== "rejected"
    );
    if (alreadySubmitted) return sendError(res, 400, "You have already submitted this task.");

    let attachmentUrl = "";
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: `nayepankh/submissions/${task._id}`,
      });
      attachmentUrl = result.secure_url;
    }

    task.submissions.push({
      volunteerId: req.user._id,
      notes,
      attachmentUrl,
      status: "submitted",
    });

    if (task.status === "open") task.status = "in_progress";
    await task.save();

    return sendSuccess(res, 200, "Task submitted successfully. Awaiting admin review.");
  } catch (err) {
    next(err);
  }
};

// ── Get My Attendance ─────────────────────────────────────────────────────────
const getMyAttendance = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      Attendance.find({ volunteerId: req.user._id })
        .populate("taskId", "title category")
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Attendance.countDocuments({ volunteerId: req.user._id }),
    ]);

    return sendSuccess(res, 200, "Attendance records retrieved.", {
      records,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ── Get My Certificates ───────────────────────────────────────────────────────
const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ volunteerId: req.user._id, isValid: true })
      .populate("issuedBy", "fullName")
      .sort({ issuedAt: -1 });

    return sendSuccess(res, 200, "Certificates retrieved.", { certificates });
  } catch (err) {
    next(err);
  }
};

// ── Get My Notifications ──────────────────────────────────────────────────────
const getMyNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter = { recipientId: req.user._id };
    if (unreadOnly === "true") filter.isRead = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipientId: req.user._id, isRead: false }),
    ]);

    return sendSuccess(res, 200, "Notifications retrieved.", {
      notifications,
      unreadCount,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ── Mark Notification as Read ─────────────────────────────────────────────────
const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return sendError(res, 404, "Notification not found.");
    return sendSuccess(res, 200, "Notification marked as read.", { notification });
  } catch (err) {
    next(err);
  }
};

// ── Dashboard Stats ───────────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [user, taskCounts, recentAttendance] = await Promise.all([
      User.findById(userId).select("totalHours tasksCompleted volunteerId status joinedAt"),
      Task.aggregate([
        { $match: { assignedTo: userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Attendance.find({ volunteerId: userId }).sort({ date: -1 }).limit(5).populate("taskId", "title"),
    ]);

    const taskStats = taskCounts.reduce((acc, { _id, count }) => {
      acc[_id] = count;
      return acc;
    }, {});

    return sendSuccess(res, 200, "Dashboard stats retrieved.", {
      totalHours: user.totalHours,
      tasksCompleted: user.tasksCompleted,
      volunteerId: user.volunteerId,
      status: user.status,
      joinedAt: user.joinedAt,
      taskStats,
      recentAttendance,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  getMyTasks,
  submitTask,
  getMyAttendance,
  getMyCertificates,
  getMyNotifications,
  markNotificationRead,
  getDashboardStats,
};
