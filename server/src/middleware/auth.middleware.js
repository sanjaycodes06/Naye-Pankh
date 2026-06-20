const { verifyAccessToken } = require("../utils/jwtHelper");
const User = require("../models/User.model");
const { sendError } = require("../utils/apiResponse");

/**
 * Protects routes — verifies Bearer JWT and attaches req.user.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, 401, "Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    // Fetch fresh user from DB (catches suspended/deleted mid-session)
    const user = await User.findById(decoded.id).select("-password -refreshToken");

    if (!user) {
      return sendError(res, 401, "User no longer exists.");
    }

    if (user.status === "suspended") {
      return sendError(res, 403, "Your account has been suspended. Contact support.");
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return sendError(res, 401, "Token expired. Please refresh your session.");
    }
    if (err.name === "JsonWebTokenError") {
      return sendError(res, 401, "Invalid token.");
    }
    next(err);
  }
};

/**
 * Restricts access to approved volunteers only.
 */
const requireApproved = (req, res, next) => {
  if (req.user.status !== "approved") {
    return sendError(
      res,
      403,
      "Your account is pending approval. Please wait for admin review."
    );
  }
  next();
};

module.exports = { protect, requireApproved };
