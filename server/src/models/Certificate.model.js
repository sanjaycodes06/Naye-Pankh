const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const certificateSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Volunteer ID is required"],
    },
    certificateType: {
      type: String,
      enum: ["participation", "appreciation", "excellence", "internship"],
      required: [true, "Certificate type is required"],
    },
    issuedFor: {
      type: String,
      required: [true, "Issued for field is required"],
      trim: true,
    },
    totalHours: { type: Number, default: 0, min: 0 },
    issuedAt: { type: Date, default: Date.now },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    certificateUrl: { type: String, default: "" }, // Cloudinary PDF URL
    verificationCode: {
      type: String,
      unique: true,
      default: () => `NP-${uuidv4().split("-")[0].toUpperCase()}`,
    },
    isValid: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
certificateSchema.index({ volunteerId: 1 });
certificateSchema.index({ verificationCode: 1 });
certificateSchema.index({ isValid: 1 });

module.exports = mongoose.model("Certificate", certificateSchema);
