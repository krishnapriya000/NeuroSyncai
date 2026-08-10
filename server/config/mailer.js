const nodemailer = require("nodemailer");

// Create Nodemailer Transporter using Gmail SMTP
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER || "neurosync00@gmail.com";
  const emailPass = process.env.EMAIL_PASS || "kmdogvjgicbchwtr";

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

/**
 * Send Password Reset Email
 * @param {string} toEmail - Recipient email address entered by the user
 * @param {string} resetUrl - Frontend reset link with token
 * @param {string} userName - User's name
 */
const sendPasswordResetEmail = async (toEmail, resetUrl, userName = "User") => {
  if (!toEmail) {
    throw new Error("Recipient email address (toEmail) is required.");
  }

  const recipientEmail = String(toEmail).trim().toLowerCase();
  const transporter = createTransporter();
  const senderEmail = process.env.EMAIL_USER || "neurosync00@gmail.com";

  console.log(`[SMTP MAILER] Preparing password reset email...`);
  console.log(`  ➔ SENDER (From): "NeuroSync AI Support" <${senderEmail}>`);
  console.log(`  ➔ RECIPIENT (To): ${recipientEmail}`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #0b0f19;
          color: #e2e8f0;
          margin: 0;
          padding: 40px 20px;
        }
        .container {
          max-width: 580px;
          margin: 0 auto;
          background: #151c2c;
          border: 1px solid #2a364f;
          border-radius: 16px;
          padding: 36px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
        }
        .header {
          text-align: center;
          padding-bottom: 24px;
          border-bottom: 1px solid #2a364f;
        }
        .logo {
          font-size: 26px;
          font-weight: 700;
          background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .content {
          padding: 28px 0;
          line-height: 1.6;
          color: #cbd5e1;
        }
        .btn-wrapper {
          text-align: center;
          margin: 32px 0;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #ffffff !important;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          padding: 14px 32px;
          border-radius: 30px;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
        }
        .link-text {
          word-break: break-all;
          font-size: 13px;
          color: #818cf8;
          background: #0f172a;
          padding: 10px 14px;
          border-radius: 8px;
          margin-top: 16px;
          border: 1px solid #1e293b;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #64748b;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid #1e293b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🧠 NeuroSync AI</div>
        </div>
        <div class="content">
          <p>Hello <strong>${userName}</strong>,</p>
          <p>We received a password reset request for your NeuroSync AI account registered under <strong>${recipientEmail}</strong>.</p>
          <p>Please click the button below to reset your password. This link is valid for <strong>1 hour</strong>.</p>
          
          <div class="btn-wrapper">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
          </div>

          <p style="font-size: 13px; color: #94a3b8;">If the button doesn't work, copy and paste the following link into your web browser:</p>
          <div class="link-text">${resetUrl}</div>

          <p style="margin-top: 24px; font-size: 13px; color: #94a3b8;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} NeuroSync AI. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"NeuroSync AI Support" <${senderEmail}>`,
    to: recipientEmail,
    replyTo: senderEmail,
    subject: "🔐 Reset Your NeuroSync AI Password",
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ [SMTP MAILER] Email successfully sent to ${recipientEmail}! Message ID: ${info.messageId}`);
  return info;
};

/**
 * Send Emergency Guardian Alert Email
 * @param {string} guardianEmail - Recipient email of the registered parent/guardian
 * @param {string} guardianName - Name of guardian (or "Guardian")
 * @param {string} studentName - Name of student (or "the student")
 */
const sendEmergencyAlertEmail = async (guardianEmail, guardianName = "Guardian", studentName = "the student") => {
  if (!guardianEmail) {
    throw new Error("Recipient guardian email address is required.");
  }

  const recipientEmail = String(guardianEmail).trim().toLowerCase();
  const transporter = createTransporter();
  const senderEmail = process.env.EMAIL_USER || "neurosync00@gmail.com";

  console.log(`[SMTP MAILER] Preparing Emergency Guardian Alert email...`);
  console.log(`  ➔ SENDER (From): "NeuroSync AI Support" <${senderEmail}>`);
  console.log(`  ➔ GUARDIAN (To): ${recipientEmail}`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #0b0f19;
          color: #e2e8f0;
          margin: 0;
          padding: 40px 20px;
        }
        .container {
          max-width: 580px;
          margin: 0 auto;
          background: #151c2c;
          border: 1px solid #dc2626;
          border-radius: 16px;
          padding: 36px;
          box-shadow: 0 12px 32px rgba(220, 38, 38, 0.2);
        }
        .header {
          text-align: center;
          padding-bottom: 24px;
          border-bottom: 1px solid #2a364f;
        }
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #ef4444;
        }
        .content {
          padding: 28px 0;
          line-height: 1.6;
          color: #cbd5e1;
        }
        .alert-box {
          background: rgba(239, 68, 68, 0.15);
          border-left: 4px solid #ef4444;
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
          color: #fca5a5;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #64748b;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid #1e293b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🛡️ NeuroSync Student Wellbeing Alert</div>
        </div>
        <div class="content">
          <p>Dear <strong>${guardianName}</strong>,</p>
          <div class="alert-box">
            NeuroSync has detected a high-risk wellbeing pattern in <strong>${studentName}</strong>'s recent check-ins.
          </div>
          <p>We recommend checking in with the student as soon as possible and providing appropriate support.</p>
          <p>Please contact the student directly. If there is an immediate safety concern, seek appropriate local emergency or professional support.</p>
          <p style="margin-top: 24px; font-size: 13px; color: #94a3b8; font-style: italic;">This message was automatically generated by NeuroSync.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} NeuroSync. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"NeuroSync Support" <${senderEmail}>`,
    to: recipientEmail,
    replyTo: senderEmail,
    subject: "NeuroSync – Student Wellbeing Alert",
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ [SMTP MAILER] Emergency alert email successfully sent to ${recipientEmail}! Message ID: ${info.messageId}`);
  return info;
};

module.exports = {
  sendPasswordResetEmail,
  sendEmergencyAlertEmail,
};
