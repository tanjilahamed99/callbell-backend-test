const User = require("../../../models/User");

const saveFcmToken = async (req, res) => {
  try {
    const { fcmToken, userId } = req.body;

    if (!fcmToken || !userId) {
      return res.status(400).json({
        success: false,
        message: "FCM token and userId are required",
      });
    }

    // Simply save/update the fcmToken field
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Save the token (this will overwrite if already exists)
    user.fcmToken = fcmToken;
    await user.save();

    res.json({
      success: true,
      message: "FCM token saved successfully",
      data: {
        userId: user._id,
        fcmToken: user.fcmToken,
      },
    });
  } catch (error) {
    console.error("❌ Save FCM Token Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save FCM token",
      error: error.message,
    });
  }
};

module.exports = saveFcmToken;
