const User = require("../../../models/User");

const createUser = async (req, res, next) => {
  const { name, email, password, referenceBy } = req.body || {};

  // Basic validation
  if (!name || !email || !password || !referenceBy) {
    return res
      .status(400)
      .send({ message: "Please provide all required fields" });
  }

  try {
    // Check for existing email with the same rol
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: `user of  ${name} already registered!`,
      });
    }

    const newUser = new User({
      name,
      email,
      password,
      referenceBy,
    });
    const savedUser = await newUser.save();

    res.status(201).send({
      success: true,
      message: "User registered successfully!",
      data: savedUser,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = createUser;
