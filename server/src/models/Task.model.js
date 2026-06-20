const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submittedAt: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
    attachmentUrl: { type: String },
    status: {
      type: String,
      enum: ["submitted", "reviewed", "approved", "rejected"],
      default: "submitted",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNotes: { type: String, trim: true },
    hoursLogged: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

const locationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["remote", "onsite"], default: "onsite" },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ["teaching", "medical", "event", "fundraising", "admin", "outreach", "other"],
      required: [true, "Task category is required"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "cancelled"],
      default: "open",
    },

    // ── Assignment ───────────────────────────────────────
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    maxVolunteers: { type: Number, default: 10, min: 1 },
    currentVolunteers: { type: Number, default: 0, min: 0 },

    // ── Location & Schedule ──────────────────────────────
    location: { type: locationSchema, default: () => ({}) },
    scheduledDate: { type: Date },
    deadline: { type: Date },
    estimatedHours: { type: Number, default: 0, min: 0 },

    // ── Files & Meta ─────────────────────────────────────
    attachments: [{ type: String }], // Cloudinary URLs
    tags: [{ type: String, trim: true, lowercase: true }],

    // ── Submissions ──────────────────────────────────────
    submissions: [submissionSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
taskSchema.index({ status: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ deadline: 1 });

// ── Virtual: Submission count ─────────────────────────────────────────────────
taskSchema.virtual("submissionCount").get(function () {
  return this.submissions ? this.submissions.length : 0;
});

module.exports = mongoose.model("Task", taskSchema);
