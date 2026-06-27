const User = require("../../../models/User");

const getUniqueContact = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "callHistory blockedGuests",
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    // Deduplicate by gestId
    const seen = new Set();
    const uniqueContacts = [];

    [...user.callHistory]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .forEach((call) => {
        if (!seen.has(call.gestId)) {
          seen.add(call.gestId);
          uniqueContacts.push({
            gestId: call.gestId,
            gestName: call.gestName,
            gestPhone: call.gestPhone,
            lastCallAt: call.time,
            // Compare both as strings to avoid ObjectId vs String mismatch
            isBlocked: user.blockedGuests.some(
              (b) => b.guestId?.toString() === call.gestId?.toString(),
            ),
          });
        }
      });

    res.json({
      success: true,
      total: uniqueContacts.length,
      contacts: uniqueContacts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getUniqueContact;
