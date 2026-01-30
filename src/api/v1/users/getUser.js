const User = require("../../../models/User");

const getUserData = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // Validate input
    if (!userId) {
      return res.status(400).json({ error: "Invalid input" });
    }

    // Update user data in the database
    const result = await User.findOne({ _id: userId });

    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      data: {
        email: result.email,
        name: result.name,
        photo: result.photo,
        role: result.role,
        phone: result.phone,
        address: result.address,
        id: result.id,
        fcmToken: result.fcmToken,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = getUserData;
