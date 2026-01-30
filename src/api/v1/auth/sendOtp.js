const randomstring = require("randomstring");
const bcrypt = require("bcrypt");
const User = require("../../../models/User");
const sendBrevoCampaign = require("../../../utils/brevoEmail");

const OTP_EXPIRY_MINUTES = 10;
const RESEND_COOLDOWN_MINUTES = 1;

const sendOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required",
        });
    }

    let user;

    try {
        user = await User.findOne({ email });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Database read error",
        });
    }

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "No user found with this email",
        });
    }

    /* ------------------ Resend Protection ------------------ */
    if (
        user.otpRequestedAt &&
        Date.now() - user.otpRequestedAt.getTime() <
        RESEND_COOLDOWN_MINUTES * 60 * 1000
    ) {
        return res.status(429).json({
            success: false,
            message: "Please wait before requesting another OTP",
        });
    }

    /* ------------------ Generate OTP ------------------ */
    const otp = randomstring.generate({
        length: 6,
        charset: "numeric",
    });

    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(
        Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    /* ------------------ Send Email ------------------ */
    try {
        await sendBrevoCampaign({
            subject: `${process.env.WEBSITE_NAME} - Password Reset Code`,
            senderName: process.env.WEBSITE_NAME,
            senderEmail: process.env.BREVO_EMAIL,
            to: email,
            htmlContent: /* your existing HTML */ `
        <h2>Hello ${user.name}</h2>
        <p>Your password reset code is:</p>
        <h1>${otp}</h1>
        <p>This code is valid for ${OTP_EXPIRY_MINUTES} minutes.</p>
      `,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to send email",
        });
    }

    /* ------------------ Save OTP Securely ------------------ */
    await User.updateOne(
        { email },
        {
            $set: {
                otp: hashedOtp,
                otpExpiresAt,
                otpRequestedAt: new Date(),
            },
        }
    );

    return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
    });
};

module.exports = sendOtp;
