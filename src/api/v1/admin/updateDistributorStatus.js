const User = require("../../../models/User");

const updateDistributorStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId required",
      });
    }

    const isExit = await User.findById(userId);
    if (!isExit) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { distributorStatus: status },
      { new: true },
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Distributor status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error retrieving distributors:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = updateDistributorStatus;
