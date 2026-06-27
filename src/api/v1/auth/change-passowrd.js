const User = require("../../../models/User");
const sendBrevoCampaign = require("../../../utils/brevoEmail");
const bcrypt = require("bcrypt");

const changePassword = async (req, res) => {
  let { email, password, code } = req.body;

  if (!email || !password || !code) {
    return res.status(400).json({ status: "error", message: "Invalid input" });
  }

  let user;

  try {
    user = await User.findOne({ email });
  } catch (e) {
    return res
      .status(404)
      .json({ status: "error", email: "error while reading database" });
  }

  if (!user) {
    return res
      .status(404)
      .json({ status: "error", email: "no user matches this email address" });
  }

  await sendBrevoCampaign({
    subject: `${process.env.WEBSITE_NAME} - Password Changed Successfully`,
    senderName: process.env.WEBSITE_NAME,
    senderEmail: process.env.BREVO_EMAIL,
    htmlContent: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">Hello ${user.name},</h2>
      <p style="font-size: 16px; color: #555;">
        This is a confirmation that your account password was successfully changed.
      </p>

      <p style="font-size: 16px; color: #555;">
        If you made this change, no further action is needed.
      </p>

      <p style="font-size: 16px; color: #555;">
        Thank you for taking steps to keep your account secure.
      </p>

      <p style="font-size: 14px; color: #999; margin-top: 40px;">
        Warm regards,<br/>
        <strong>The ${process.env.WEBSITE_NAME} Team</strong>
      </p>

      <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        © ${new Date().getFullYear()} ${
      process.env.WEBSITE_NAME
    }.in — All rights reserved.
      </p>
    </div>
  </div>
  `,
    to: email,
  });

  await User.findOneAndUpdate({ email }, { $set: { password: await bcrypt.hash(password, 10) } });
  res
    .status(200)
    .json({ success: true, message: "password changed successfully" });
};

module.exports = changePassword;
