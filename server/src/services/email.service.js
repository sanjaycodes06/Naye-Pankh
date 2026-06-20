const transporter = require("../config/email");
const logger = require("../utils/logger");

const FROM = process.env.EMAIL_FROM || "NayePankh Foundation <noreply@nayepankh.org>";

/**
 * Core send function. All specific email helpers call this.
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({ from: FROM, to, subject, html });
    logger.info(`Email sent to ${to} — MessageID: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};

// ── Template Helpers ──────────────────────────────────────────────────────────

const baseTemplate = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #1a5276; color: white; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 22px; }
    .body { padding: 32px; color: #333; line-height: 1.6; }
    .footer { background: #f4f4f4; padding: 16px 32px; font-size: 12px; color: #888; text-align: center; }
    .btn { display: inline-block; background: #1a5276; color: white; padding: 12px 28px;
           border-radius: 6px; text-decoration: none; margin-top: 20px; }
    .otp { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a5276;
           text-align: center; padding: 20px; background: #eaf0fb; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>NayePankh Foundation</h1></div>
    <div class="body">
      <h2>${title}</h2>
      ${bodyHtml}
    </div>
    <div class="footer">NayePankh Foundation &bull; Making a Difference Together</div>
  </div>
</body>
</html>`;

const sendVerificationEmail = async (to, name, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail({
    to,
    subject: "Verify your email — NayePankh Foundation",
    html: baseTemplate(
      `Welcome, ${name}!`,
      `<p>Thank you for registering with NayePankh Foundation. Please verify your email address to activate your account.</p>
       <a class="btn" href="${url}">Verify Email</a>
       <p style="margin-top:20px;font-size:13px;color:#888;">This link expires in 24 hours. If you did not register, please ignore this email.</p>`
    ),
  });
};

const sendApprovalEmail = async (to, name, volunteerId) => {
  await sendEmail({
    to,
    subject: "🎉 Your volunteer application is approved!",
    html: baseTemplate(
      `You're approved, ${name}!`,
      `<p>We're thrilled to welcome you to the NayePankh volunteer family. Your application has been reviewed and approved.</p>
       <p><strong>Your Volunteer ID:</strong> ${volunteerId}</p>
       <p>You can now log in to your dashboard, view assigned tasks, track your hours, and download certificates.</p>
       <a class="btn" href="${process.env.CLIENT_URL}/login">Go to Dashboard</a>`
    ),
  });
};

const sendRejectionEmail = async (to, name, reason = "") => {
  await sendEmail({
    to,
    subject: "Update on your NayePankh volunteer application",
    html: baseTemplate(
      `Application Update, ${name}`,
      `<p>Thank you for your interest in volunteering with NayePankh Foundation.</p>
       <p>After careful review, we are unable to approve your application at this time.</p>
       ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
       <p>You are welcome to re-apply in the future. For queries, reply to this email.</p>`
    ),
  });
};

const sendPasswordResetOTP = async (to, name, otp) => {
  await sendEmail({
    to,
    subject: "Password Reset OTP — NayePankh Foundation",
    html: baseTemplate(
      "Reset Your Password",
      `<p>Hi ${name}, we received a request to reset your password. Use the OTP below:</p>
       <div class="otp">${otp}</div>
       <p style="text-align:center;font-size:13px;color:#888;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
       <p>If you did not request a password reset, you can safely ignore this email.</p>`
    ),
  });
};

const sendTaskAssignmentEmail = async (to, name, taskTitle, deadline) => {
  await sendEmail({
    to,
    subject: `New task assigned: ${taskTitle}`,
    html: baseTemplate(
      "You have a new task!",
      `<p>Hi ${name}, a new task has been assigned to you on the NayePankh volunteer portal.</p>
       <p><strong>Task:</strong> ${taskTitle}</p>
       ${deadline ? `<p><strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString("en-IN")}</p>` : ""}
       <a class="btn" href="${process.env.CLIENT_URL}/volunteer/tasks">View Task</a>`
    ),
  });
};

const sendCertificateEmail = async (to, name, certificateType, certificateUrl) => {
  await sendEmail({
    to,
    subject: `Your ${certificateType} certificate is ready!`,
    html: baseTemplate(
      `Congratulations, ${name}!`,
      `<p>Your <strong>${certificateType}</strong> certificate from NayePankh Foundation has been issued.</p>
       <p>You can download it from your volunteer dashboard or use the link below.</p>
       <a class="btn" href="${certificateUrl}">Download Certificate</a>
       <p style="margin-top:20px;font-size:13px;color:#888;">You can also share your verification link so others can confirm the authenticity of your certificate.</p>`
    ),
  });
};

module.exports = {
  sendVerificationEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendPasswordResetOTP,
  sendTaskAssignmentEmail,
  sendCertificateEmail,
};
