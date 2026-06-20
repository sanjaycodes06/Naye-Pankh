const crypto = require("crypto");
const User = require("../models/User.model");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} = require("../utils/jwtHelper");
const generateVolunteerId = require("../utils/generateVolunteerId");
const {
  sendVerificationEmail,
  sendPasswordResetOTP,
  sendApprovalEmail,
} = require("../services/email.service");

// ── Register ──────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { email } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return sendError(res, 409, "An account with this email already exists.");
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      ...req.body,
      emailVerificationToken: verificationToken,
      emailVerified: false,
      status: "pending",
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(user.email, user.fullName, verificationToken).catch(() => {});

    return sendSuccess(res, 201, "Registration successful! Please verify your email.", {
      userId: user._id,
    });
  } catch (err) {
    next(err);
  }
};

// ── Verify Email ──────────────────────────────────────────────────────────────
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ emailVerificationToken: token }).select(
      "+emailVerificationToken"
    );

    if (!user) {
      return sendError(res, 400, "Invalid or expired verification link.");
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return sendSuccess(res, 200, "Email verified successfully. Awaiting admin approval.");
  } catch (err) {
    next(err);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password +refreshToken");

    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, "Invalid email or password.");
    }

    // if (!user.emailVerified) {
    //   return sendError(res, 403, "Please verify your email before logging in.");
    // }

    if (user.status === "rejected") {
      return sendError(res, 403, "Your application was not approved.");
    }
    if (user.status === "suspended") {
      return sendError(res, 403, "Your account has been suspended. Contact support.");
    }

    const tokenPayload = { id: user._id, role: user.role, status: user.status };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ id: user._id });

    // Store hashed refresh token
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    setRefreshCookie(res, refreshToken);

    return sendSuccess(res, 200, "Login successful.", {
      accessToken,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// ── Refresh Token ─────────────────────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return sendError(res, 401, "No refresh token provided.");

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
      clearRefreshCookie(res);
      return sendError(res, 401, "Invalid refresh token. Please log in again.");
    }

    const tokenPayload = { id: user._id, role: user.role, status: user.status };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken({ id: user._id });

    // Rotate refresh token
    user.refreshToken = newRefreshToken;
    await user.save();
    setRefreshCookie(res, newRefreshToken);

    return sendSuccess(res, 200, "Token refreshed.", { accessToken: newAccessToken });
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      clearRefreshCookie(res);
      return sendError(res, 401, "Session expired. Please log in again.");
    }
    next(err);
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+refreshToken");
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    clearRefreshCookie(res);
    return sendSuccess(res, 200, "Logged out successfully.");
  } catch (err) {
    next(err);
  }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("+passwordResetOTP +passwordResetOTPExpiry");

    // Always return the same message to prevent email enumeration
    const MSG = "If an account with that email exists, an OTP has been sent.";

    if (!user) return sendSuccess(res, 200, MSG);

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
    user.passwordResetOTP = otp;
    user.passwordResetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    sendPasswordResetOTP(user.email, user.fullName, otp).catch(() => {});

    return sendSuccess(res, 200, MSG);
  } catch (err) {
    next(err);
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select("+passwordResetOTP +passwordResetOTPExpiry");

    if (
      !user ||
      user.passwordResetOTP !== otp ||
      !user.passwordResetOTPExpiry ||
      user.passwordResetOTPExpiry < new Date()
    ) {
      return sendError(res, 400, "Invalid or expired OTP.");
    }

    user.password = newPassword;
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpiry = undefined;
    user.refreshToken = undefined; // Invalidate all sessions
    await user.save();

    clearRefreshCookie(res);
    return sendSuccess(res, 200, "Password reset successfully. Please log in.");
  } catch (err) {
    next(err);
  }
};

// ── Get Current User (role-agnostic session bootstrap) ────────────────────────
// Used by the frontend on page load/refresh to restore the session for ANY
// authenticated role (volunteer, admin, superadmin). Unlike /volunteers/me,
// this is not restricted to a single role — it simply returns whoever the
// JWT identifies. req.user is already attached and sanitized by `protect`.
const getCurrentUser = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, "Current user retrieved.", { user: req.user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
};
