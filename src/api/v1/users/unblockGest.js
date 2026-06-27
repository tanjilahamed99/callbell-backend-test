const User = require("../../../models/User");

const unblockGest = async (req, res, next) => {
  try {
    const { userId, guestId } = req.params;

    if (!userId || !guestId) {
      return res.status(400).json({ error: "userId and guestId are required" });
    }

    // Check if actually blocked
    const user = await User.findOne({
      _id: userId,
      "blockedGuests.guestId": guestId,
    });

    if (!user) {
      return res.status(400).json({ message: "Guest is not blocked" });
    }

    await User.findByIdAndUpdate(
      userId,
      { $pull: { blockedGuests: { guestId } } },
      { new: true },
    );

    res.json({ success: true, message: "Guest unblocked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = unblockGest;
