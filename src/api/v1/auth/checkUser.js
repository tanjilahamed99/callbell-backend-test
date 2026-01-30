const User = require("../../../models/User");

const checkUser = async (req, res, next) => {
  let { id } = req.body;

  User.findOne({ _id: id })
    .then((user) => res.status(200).json(user))
    .catch(() => res.status(404).json({ error: "User not found" }));
};

module.exports = checkUser;
