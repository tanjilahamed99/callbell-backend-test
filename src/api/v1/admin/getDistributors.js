const User = require("../../../models/User");

const getDistributors = async (req, res, next) => {
  try {
    const distributors = await User.find({ role: "distributor" }).select(
      "-password",
    );
    return res.status(200).json({
      success: true,
      message: "Distributors retrieved successfully",
      distributors: distributors,
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

module.exports = getDistributors;
