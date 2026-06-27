const router = require("express").Router();
const Gest = require("../../models/Gest");

router.post("/update", async (req, res) => {
  try {
    const { name, phone } = req.body;

    const rawIp =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket.remoteAddress ||
      req.ip;

    const ip = rawIp === "::1" ? "127.0.0.1 (localhost)" : rawIp;

    // Check if this phone OR this IP is blocked anywhere in the system
    const User = require("../../models/User");

    const blockedByPhone = await User.findOne({
      "blockedGuests.guestNumber": phone,
    });

    const blockedByIp = await User.findOne({
      "blockedGuests.ip": ip,
    });

    if (blockedByPhone || blockedByIp) {
      return res.status(403).json({
        message: "Access denied",
        blocked: true,
      });
    }

    // Check if guest already exists by phone or IP
    let gest = await Gest.findOne({ $or: [{ phone }, { ip }] });

    if (gest) {
      // Update existing guest with latest info
      gest = await Gest.findByIdAndUpdate(
        gest._id,
        { $set: { ip, name, phone } },
        { new: true },
      );
    } else {
      gest = await Gest.create({ ip, name, phone });
    }

    res.status(201).json({ success: true, ...gest._doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
