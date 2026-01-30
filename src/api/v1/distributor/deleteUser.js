const User = require("../../../models/User");

const disDeleteUser = async (req, res, next) => {
  const { id } = req.params || {};

  // Basic validation
  if (!id) {
    return res
      .status(400)
      .send({ message: "Please provide all required fields" });
  }

  try {
    const users = await User.deleteOne({ _id: id });
    res.status(201).send({
      success: true,
      message: "Users deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = disDeleteUser;
