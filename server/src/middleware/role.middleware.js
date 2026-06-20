const { sendError } = require("../utils/apiResponse");

/**
 * Role-based access control factory.
 * Usage: authorizeRoles("admin", "superadmin")
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, "Authentication required.");
    }
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Required role(s): ${roles.join(", ")}.`
      );
    }
    next();
  };
};

module.exports = { authorizeRoles };
