const LiveKit = require("../../../models/LliveKit");

const getLiveKitData = async (req, res, next) => {
  try {
    const settings = await LiveKit.findOne(); // Only one document expected
    if (!settings) {
      return res
        .status(404)
        .json({ message: "LiveKit settings not found", success: false });
    }
    const data = {
      url: settings.url,
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching LiveKit settings", success: false });
  }
};

module.exports = getLiveKitData;
