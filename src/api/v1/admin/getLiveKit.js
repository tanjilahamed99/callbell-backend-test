const LiveKit = require("../../../models/LliveKit");

const getLiveKit = async (req, res, next) => {
  try {
    const settings = await LiveKit.findOne(); // Only one document expected
    if (!settings) {
      return res
        .status(404)
        .json({ message: "LiveKit settings not found", success: false });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching LiveKit settings", success: false });
  }
};

module.exports = getLiveKit;
