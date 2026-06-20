const express = require("express");
const router = express.Router();

const {
  register, verifyEmail, login, refreshToken, logout, forgotPassword, resetPassword, getCurrentUser,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate, registerSchema, loginSchema, resetPasswordSchema } = require("../utils/validators");

// Public routes
router.post("/register", validate(registerSchema), register);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", validate(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

// Protected — works for any authenticated role (volunteer, admin, superadmin)
router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logout);

module.exports = router;
