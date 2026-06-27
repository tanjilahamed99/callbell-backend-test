const User = require("../../../models/User");

const updateUserContactData = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const newCallEntry = req.body;

    if (!userId || !newCallEntry) {
      return res.status(400).json({ error: "Invalid input" });
    }

    console.log(newCallEntry);

    // $push ADDS to the array, keeps all previous data
    const result = await User.findByIdAndUpdate(
      userId,
      { $push: { callHistory: newCallEntry } },
      { new: true },
    );

    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Call history updated successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = updateUserContactData;
