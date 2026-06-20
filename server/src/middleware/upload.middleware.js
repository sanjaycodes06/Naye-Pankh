const multer = require("multer");

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_DOC_TYPES = [...ALLOWED_IMAGE_TYPES, "application/pdf"];
const MAX_SIZE_MB = 5 * 1024 * 1024; // 5MB

/**
 * In-memory storage — files are passed as buffers to controllers,
 * which then upload to Cloudinary.
 */
const storage = multer.memoryStorage();

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`), false);
  }
};

/** Upload a single profile photo */
const uploadPhoto = multer({
  storage,
  limits: { fileSize: MAX_SIZE_MB },
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
}).single("photo");

/** Upload a single document (PDF or image) */
const uploadDocument = multer({
  storage,
  limits: { fileSize: MAX_SIZE_MB },
  fileFilter: fileFilter(ALLOWED_DOC_TYPES),
}).single("document");

/** Upload multiple task attachments (max 5) */
const uploadAttachments = multer({
  storage,
  limits: { fileSize: MAX_SIZE_MB },
  fileFilter: fileFilter(ALLOWED_DOC_TYPES),
}).array("attachments", 5);

module.exports = { uploadPhoto, uploadDocument, uploadAttachments };
