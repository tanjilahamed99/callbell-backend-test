const User = require("../../../models/User");

const updateUserData = async (req, res, next) => {
  try {
    const { ...rest } = req.body;
    const { userId } = req.params;
    // Validate input
    if (!userId || !rest) {
      return res.status(400).json({ error: "Invalid input" });
    }

    // Update user data in the database
    const result = await User.updateOne({ _id: userId }, { $set: rest });

    if (result.nModified === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = updateUserData;
