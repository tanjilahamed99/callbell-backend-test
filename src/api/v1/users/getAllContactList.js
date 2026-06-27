const User = require("../../../models/User");

const getUserContactData = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("callHistory");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      callHistory: user.callHistory,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getUserContactData;
