const logger = require("../utils/logger");

/**
 * Global error handling middleware.
 * Must have 4 parameters to be recognized by Express as error middleware.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(". ");
    statusCode = 422;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  // JWT errors (should mostly be caught in middleware, but fallback)
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token.";
    statusCode = 401;
  }
  if (err.name === "TokenExpiredError") {
    message = "Token expired.";
    statusCode = 401;
  }

  // Multer file upload errors (size limit, unexpected field, etc.)
  if (err.name === "MulterError") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File is too large. Maximum size is 5MB.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field. Please check the upload form.";
    } else {
      message = err.message || "File upload failed.";
    }
  }

  // Custom file-type rejection thrown from upload.middleware.js fileFilter
  if (err.message?.startsWith("Invalid file type")) {
    statusCode = 400;
    message = err.message;
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} — ${err.stack || err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
