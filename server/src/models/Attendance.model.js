const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Volunteer ID is required"],
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    eventName: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Attendance date is required"],
    },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    hoursLogged: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      default: "present",
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Marked by (admin) is required"],
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// ── Auto-calculate hours from checkIn/Out ─────────────────────────────────────
attendanceSchema.pre("save", function (next) {
  if (this.checkInTime && this.checkOutTime && !this.hoursLogged) {
    const diff = (this.checkOutTime - this.checkInTime) / (1000 * 60 * 60);
    this.hoursLogged = parseFloat(Math.max(0, diff).toFixed(2));
  }
  next();
});

// ── Indexes ───────────────────────────────────────────────────────────────────
attendanceSchema.index({ volunteerId: 1, date: -1 });
attendanceSchema.index({ taskId: 1 });
attendanceSchema.index({ date: -1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
