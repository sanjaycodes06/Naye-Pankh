const express = require("express");
const router = express.Router();

const { verifyCertificate, getPublicAnnouncements } = require("../controllers/public.controller");

// Certificate public verification
router.get("/verify/:code", verifyCertificate);

// Public announcements
router.get("/announcements", getPublicAnnouncements);

module.exports = router;
