const User = require("../../../models/User");

const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find();

    const users = allUsers.filter((user) => user.role !== "admin");
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = getAllUsers;
