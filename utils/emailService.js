const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initialize or get existing Nodemailer transporter
 */
const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('⚠️  [SMTP] SMTP_USER or SMTP_PASS not set. Real emails will not be sent.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  return transporter;
};

/**
 * Send OTP Verification Email
 * @param {string} toEmail - Recipient email
 * @param {string} otpCode - 4-digit OTP code
 * @param {string} type - 'LOGIN' | 'SIGNUP' | 'RESET_PASSWORD'
 */
const sendOtpEmail = async (toEmail, otpCode, type = 'LOGIN') => {
  const mailTransporter = getTransporter();

  // If credentials are not configured, fallback to console logging
  if (!mailTransporter) {
    console.log(`\n📧 [Console Fallback OTP for ${toEmail}]: ${otpCode} (Valid for 10 mins)\n`);
    return { success: true, fallback: true };
  }

  const isSignup = type === 'SIGNUP';
  const subject = isSignup
    ? 'Verification Code for Account Signup - Pooja Goeazz'
    : 'Your Login Verification Code - Pooja Goeazz';

  const fromName = process.env.SMTP_FROM_NAME || 'Pooja Goeazz';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f6f5fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #eae6f0;">
              
              <!-- Header -->
              <tr>
                <td align="center" style="background: linear-gradient(135deg, #7e22ce 0%, #a855f7 100%); padding: 32px 20px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">Pooja Goeazz</h1>
                  <p style="color: #f3e8ff; margin: 6px 0 0 0; font-size: 14px;">Secure Verification</p>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 32px 28px 24px 28px;">
                  <h2 style="color: #1f142b; font-size: 18px; margin: 0 0 12px 0; font-weight: 600;">
                    ${isSignup ? 'Welcome! Complete your registration' : 'Hello,'}
                  </h2>
                  <p style="color: #584f67; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                    Use the following verification code to ${isSignup ? 'create your account' : 'sign in to Pooja Goeazz'}. This code is valid for <strong>10 minutes</strong>.
                  </p>

                  <!-- OTP Box -->
                  <div style="background-color: #faf5ff; border: 2px dashed #a855f7; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0 28px 0;">
                    <span style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #7e22ce; font-family: monospace;">${otpCode}</span>
                  </div>

                  <p style="color: #837b94; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">
                    ⚠️ If you did not request this verification code, please ignore this email or contact support. Never share this code with anyone.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #faf9fc; padding: 20px; text-align: center; border-top: 1px solid #eae6f0;">
                  <p style="color: #a29bb3; font-size: 12px; margin: 0;">
                    &copy; ${new Date().getFullYear()} Pooja Goeazz. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const info = await mailTransporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: toEmail,
    subject,
    html,
    text: `Your verification code is: ${otpCode}. It is valid for 10 minutes.`
  });

  return { success: true, messageId: info.messageId };
};

/**
 * Send Password Reset Link Email
 * @param {string} toEmail - Recipient email
 * @param {string} resetToken - Hex reset token
 */
const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const mailTransporter = getTransporter();

  if (!mailTransporter) {
    console.log(`\n🔑 [Console Fallback Reset Token for ${toEmail}]: ${resetToken}\n`);
    return { success: true, fallback: true };
  }

  const clientUrl = process.env.CLIENT_URL || 'https://pooja.goeazz.com';
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;
  const fromName = process.env.SMTP_FROM_NAME || 'Pooja Goeazz';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f6f5fa; font-family: sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #eae6f0;">
              <tr>
                <td align="center" style="background: linear-gradient(135deg, #7e22ce 0%, #a855f7 100%); padding: 32px 20px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px;">Pooja Goeazz</h1>
                  <p style="color: #f3e8ff; margin: 6px 0 0 0;">Password Reset Request</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px 28px;">
                  <p style="color: #584f67; font-size: 15px; line-height: 1.6;">
                    You requested to reset your password. Click the button below to set a new password:
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #7e22ce; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                      Reset Password
                    </a>
                  </div>
                  <p style="color: #837b94; font-size: 13px;">This link will expire in 15 minutes. If you did not make this request, you can safely ignore this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const info = await mailTransporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: toEmail,
    subject: 'Password Reset Request - Pooja Goeazz',
    html
  });

  return { success: true, messageId: info.messageId };
};

module.exports = {
  sendOtpEmail,
  sendPasswordResetEmail
};
