const randomstring = require("randomstring");
const bcrypt = require("bcrypt");
const User = require("../../../models/User");
const sendBrevoCampaign = require("../../../utils/brevoEmail");

const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_MINUTES = 1;

/* ─────────────────────────────────────────────
   HTML Email Template
───────────────────────────────────────────── */
const buildResetEmail = ({ name, otp, expiryMinutes, websiteName }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:48px 16px;">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0"
    style="max-width:520px;background:#ffffff;border-radius:20px;
           overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">

    <!-- Gradient Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:40px 40px 32px;text-align:center;">
        <div style="display:inline-block;background:rgba(255,255,255,0.15);
                    border-radius:14px;padding:10px 20px;margin-bottom:20px;">
          <span style="color:#fff;font-size:18px;font-weight:700;
                       font-family:'Segoe UI',sans-serif;letter-spacing:0.5px;">
            🔒 ${websiteName}
          </span>
        </div>
        <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;
                   font-family:'Segoe UI',sans-serif;letter-spacing:-0.3px;">
          Password Reset
        </h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;
                  font-family:'Segoe UI',sans-serif;">
          We received a request to reset your password
        </p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:36px 40px 0;">
        <p style="margin:0 0 6px;font-size:15px;color:#374151;
                  font-family:'Segoe UI',sans-serif;line-height:1.6;">
          Hi <strong style="color:#111827;">${name}</strong> 👋
        </p>
        <p style="margin:0;font-size:15px;color:#6b7280;
                  font-family:'Segoe UI',sans-serif;line-height:1.7;">
          Use the verification code below to reset your
          <strong style="color:#4f46e5;">${websiteName}</strong> account password.
          Do not share this code with anyone.
        </p>
      </td>
    </tr>

    <!-- OTP Box -->
    <tr>
      <td align="center" style="padding:32px 40px 8px;">
        <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#9ca3af;
                  letter-spacing:3px;text-transform:uppercase;
                  font-family:'Segoe UI',sans-serif;">
          Verification Code
        </p>
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:linear-gradient(135deg,#eef2ff,#ede9fe);
                       border:2px solid #a5b4fc;border-radius:16px;
                       padding:20px 52px;text-align:center;">
              <span style="font-size:46px;font-weight:800;letter-spacing:16px;
                           color:#4338ca;font-family:'Courier New',Courier,monospace;">
                ${otp}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Timer Badge -->
    <tr>
      <td align="center" style="padding:16px 40px 0;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:#fef9c3;border:1px solid #fde047;
                       border-radius:30px;padding:7px 20px;">
              <span style="font-size:13px;color:#854d0e;font-weight:600;
                           font-family:'Segoe UI',sans-serif;">
                ⏳ &nbsp;Expires in <strong>${expiryMinutes} minutes</strong>
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Steps -->
    <tr>
      <td style="padding:28px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:#f8fafc;border-radius:12px;padding:0;">
          <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 12px;font-size:12px;font-weight:700;
                        color:#6b7280;letter-spacing:2px;text-transform:uppercase;
                        font-family:'Segoe UI',sans-serif;">
                How to use
              </p>
              <p style="margin:0 0 6px;font-size:13px;color:#374151;
                        font-family:'Segoe UI',sans-serif;line-height:1.6;">
                1️⃣ &nbsp;Go back to the password reset page
              </p>
              <p style="margin:0 0 6px;font-size:13px;color:#374151;
                        font-family:'Segoe UI',sans-serif;line-height:1.6;">
                2️⃣ &nbsp;Enter the 6-digit code above
              </p>
              <p style="margin:0;font-size:13px;color:#374151;
                        font-family:'Segoe UI',sans-serif;line-height:1.6;">
                3️⃣ &nbsp;Set your new password
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Warning -->
    <tr>
      <td style="padding:20px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:#fff1f2;border-left:4px solid #fb7185;
                 border-radius:0 10px 10px 0;">
          <tr>
            <td style="padding:14px 18px;">
              <p style="margin:0;font-size:13px;color:#9f1239;line-height:1.6;
                        font-family:'Segoe UI',sans-serif;">
                🚨 <strong>Didn't request this?</strong> Ignore this email safely.
                Your password will <strong>not</strong> change unless you use this code.
                Contact support if you're concerned.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Divider -->
    <tr>
      <td style="padding:28px 40px 0;">
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"/>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" style="padding:20px 40px 36px;">
        <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;
                  font-family:'Segoe UI',sans-serif;line-height:1.8;">
          Sent by <strong style="color:#4f46e5;">${websiteName}</strong> &nbsp;·&nbsp;
          Do not reply to this email
        </p>
        <p style="margin:0;font-size:11px;color:#d1d5db;
                  font-family:'Segoe UI',sans-serif;">
          © ${new Date().getFullYear()} ${websiteName}. All rights reserved.
        </p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>
`;

/* ─────────────────────────────────────────────
   Controller
───────────────────────────────────────────── */
const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  let user;
  try {
    user = await User.findOne({ email });
  } catch {
    return res.status(500).json({ success: false, message: "Database read error" });
  }

  if (!user) {
    return res.status(404).json({ success: false, message: "No user found with this email" });
  }

  /* Resend cooldown */
  if (
    user.otpRequestedAt &&
    Date.now() - user.otpRequestedAt.getTime() < RESEND_COOLDOWN_MINUTES * 60 * 1000
  ) {
    return res.status(429).json({ success: false, message: "Please wait before requesting another OTP" });
  }

  /* Generate OTP */
  const otp = randomstring.generate({ length: 6, charset: "numeric" });
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  /* Send Email */
  try {
    await sendBrevoCampaign({
      subject: `${process.env.WEBSITE_NAME} - Password Reset Code`,
      senderName: process.env.WEBSITE_NAME,
      senderEmail: process.env.BREVO_EMAIL,
      to: email,
      htmlContent: buildResetEmail({
        name: user.name,                    // ✅ Fixed: was ${name}
        otp,
        expiryMinutes: OTP_EXPIRY_MINUTES,  // ✅ Fixed: was ${otpExpiresAt} (wrong!)
        websiteName: process.env.WEBSITE_NAME,
      }),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to send email" });
  }

  /* Save OTP */
  await User.updateOne(
    { email },
    { $set: { otp: hashedOtp, otpExpiresAt, otpRequestedAt: new Date() } }
  );

  return res.status(200).json({ success: true, message: "OTP sent successfully" });
};

module.exports = sendOtp;
