const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const availabilitySchema = new mongoose.Schema(
  {
    weekdays: { type: Boolean, default: false },
    weekends: { type: Boolean, default: false },
    mornings: { type: Boolean, default: false },
    evenings: { type: Boolean, default: false },
  },
  { _id: false }
);

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relation: { type: String, trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // ── Core Auth ────────────────────────────────────────
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ["volunteer", "admin", "superadmin"],
      default: "volunteer",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },

    // ── Personal Info ────────────────────────────────────
    phone: { type: String, trim: true },
    profilePhoto: { type: String, default: "" }, // Cloudinary URL
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    address: { type: String, trim: true },

    // ── Volunteer Details ────────────────────────────────
    skills: [{ type: String, trim: true }],
    areasOfInterest: [{ type: String, trim: true }],
    availability: { type: availabilitySchema, default: () => ({}) },
    languages: [{ type: String, trim: true }],
    education: { type: String, trim: true },
    occupation: { type: String, trim: true },
    emergencyContact: { type: emergencyContactSchema, default: () => ({}) },

    // ── System / Tracking ────────────────────────────────
    volunteerId: { type: String, unique: true, sparse: true },
    totalHours: { type: Number, default: 0, min: 0 },
    tasksCompleted: { type: Number, default: 0, min: 0 },
    joinedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastLogin: { type: Date },

    // ── Auth Tokens ──────────────────────────────────────
    refreshToken: { type: String, select: false },
    emailVerificationToken: { type: String, select: false },
    emailVerified: { type: Boolean, default: false },
    passwordResetOTP: { type: String, select: false },
    passwordResetOTPExpiry: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ volunteerId: 1 });

// ── Pre-save: Hash password ───────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: Compare passwords ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: Sanitize output ─────────────────────────────────────────
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.emailVerificationToken;
  delete obj.passwordResetOTP;
  delete obj.passwordResetOTPExpiry;
  return obj;
};

// ── Virtual: Full photo URL fallback ─────────────────────────────────────────
userSchema.virtual("photoUrl").get(function () {
  return (
    this.profilePhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(this.fullName)}&background=random`
  );
});

module.exports = mongoose.model("User", userSchema);
