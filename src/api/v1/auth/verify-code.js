const User = require("../../../models/User");

const verifyCode = async (req, res) => {
  let { email, code } = req.body;

  if (!email) {
    return res.status(400).json({ status: "error", email: "email required" });
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

  const isValidOtp = await bcrypt.compare(code, user.otp);

  if (!isValidOtp || user.otpExpiresAt < new Date()) {
    return res.status(400).json({ status: "error", message: "Invalid or expired OTP" });
  }

  // Clear OTP after successful verification
  user.otp = null;
  user.otpExpiresAt = null;
  user.otpRequestedAt = null;
  await user.save();

  res.status(200).json({ success: true, message: "otp matched" });
};

module.exports = verifyCode;
