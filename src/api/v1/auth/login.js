const User = require("../../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ status: false, message: "User not found" });
    }
    const passwordMatched = await bcrypt.compare(password || "", user.password);

    if (!passwordMatched) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid password" });
    }

    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      picture: user.picture,
    };

    const fcmToken = user.fcmToken

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 60 * 60 * 24 * 60 },
      (err, token) => {
        if (err) return res.status(500).json({ token: "Error signing token." });
        res.status(200).json({ token, fcmToken });
      }
    );

    // use appropriate status code to send data
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

module.exports = login;
