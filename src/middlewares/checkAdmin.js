const User = require("../models/User");

const checkAdmin = async (req, res, next) => {
  try {
    const { id, email } = req.params;
    const isAdmin = await User.findOne({
      _id: id,
      email,
      role: "admin",
    });

    if (!isAdmin) {
      return res.status(401).send({
        message: "Invalid data",
        success: false,
      });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.send({
      message: "An error occurred while processing your request.",
    });
  }
};

module.exports = checkAdmin;
