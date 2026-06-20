const Joi = require("joi");

// ── Auth Validators ───────────────────────────────────────────────────────────
const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.pattern.base": "Password must contain uppercase, lowercase, and a number",
    }),
  phone: Joi.string().pattern(/^[0-9+\-\s]{7,15}$/).optional(),
  dateOfBirth: Joi.date().max("now").optional(),
  gender: Joi.string().valid("male", "female", "other", "prefer_not_to_say").optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(100).optional(),
  address: Joi.string().max(300).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  areasOfInterest: Joi.array().items(Joi.string()).optional(),
  languages: Joi.array().items(Joi.string()).optional(),
  education: Joi.string().max(200).optional(),
  occupation: Joi.string().max(200).optional(),
  availability: Joi.object({
    weekdays: Joi.boolean(),
    weekends: Joi.boolean(),
    mornings: Joi.boolean(),
    evenings: Joi.boolean(),
  }).optional(),
  emergencyContact: Joi.object({
    name: Joi.string().max(100),
    phone: Joi.string().max(20),
    relation: Joi.string().max(50),
  }).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required(),
});

// ── Task Validators ───────────────────────────────────────────────────────────
const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(2000).optional(),
  category: Joi.string()
    .valid("teaching", "medical", "event", "fundraising", "admin", "outreach", "other")
    .required(),
  priority: Joi.string().valid("low", "medium", "high", "urgent").optional(),
  maxVolunteers: Joi.number().min(1).optional(),
  location: Joi.object({
    type: Joi.string().valid("remote", "onsite"),
    address: Joi.string().max(300),
    city: Joi.string().max(100),
  }).optional(),
  scheduledDate: Joi.date().optional(),
  deadline: Joi.date().optional(),
  estimatedHours: Joi.number().min(0).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

// ── Generic validate helper ───────────────────────────────────────────────────
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: false });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(422).json({ success: false, message: "Validation failed", errors: messages });
  }
  next();
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  createTaskSchema,
};
