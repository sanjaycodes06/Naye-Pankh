const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter on startup (non-fatal in dev)
transporter.verify((error) => {
  if (error) {
    logger.warn("Email transporter verification failed:", error.message);
  } else {
    logger.info("Email transporter is ready");
  }
});

module.exports = transporter;
