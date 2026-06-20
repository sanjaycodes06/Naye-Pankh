const Certificate = require("../models/Certificate.model");
const Announcement = require("../models/Announcement.model");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// ── Verify Certificate by Code ────────────────────────────────────────────────
const verifyCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({ verificationCode: req.params.code })
      .populate("volunteerId", "fullName volunteerId")
      .populate("issuedBy", "fullName");

    if (!cert) return sendError(res, 404, "Certificate not found or invalid verification code.");
    if (!cert.isValid) return sendError(res, 410, "This certificate has been revoked.");

    return sendSuccess(res, 200, "Certificate is valid.", {
      certificate: {
        type: cert.certificateType,
        issuedFor: cert.issuedFor,
        totalHours: cert.totalHours,
        issuedAt: cert.issuedAt,
        issuedBy: cert.issuedBy?.fullName,
        volunteer: {
          name: cert.volunteerId?.fullName,
          volunteerId: cert.volunteerId?.volunteerId,
        },
        verificationCode: cert.verificationCode,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Public Announcements ──────────────────────────────────────────────────────
const getPublicAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({
      targetAudience: "all",
      $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
    })
      .select("title content isPinned createdAt")
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(10);

    return sendSuccess(res, 200, "Announcements retrieved.", { announcements });
  } catch (err) {
    next(err);
  }
};

module.exports = { verifyCertificate, getPublicAnnouncements };
