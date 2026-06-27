const Gest = require("../../../models/Gest");
const User = require("../../../models/User");

const blockGest = async (req, res, next) => {
  try {
    const { userId, guestId } = req.params;

    console.log(userId, guestId);

    if (!userId || !guestId) {
      return res.status(400).json({ error: "userId and guestId are required" });
    }

    // Check if already blocked
    const alreadyBlocked = await User.findOne({
      _id: userId,
      "blockedGuests.guestId": guestId,
    });

    if (alreadyBlocked) {
      return res.status(400).json({ message: "Guest already blocked" });
    }

    // Fetch guest data from Gest schema
    const gest = await Gest.findById(guestId);

    if (!gest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          blockedGuests: {
            guestId: gest._id,
            gestName: gest.name,
            guestNumber: gest.phone,
            ip: gest.ip,
          },
        },
      },
      { new: true },
    );

    res.json({ success: true, message: "Guest blocked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = blockGest;
