const LiveKit = require("../../../models/LliveKit");

const setLiveKit = async (req, res, next) => {
  try {
    const updatedData = req.body;
    let settings = await LiveKit.findOne();
    if (!settings) {
      // If no document exists yet, create it
      settings = new LiveKit(updatedData);
    } else {
      // Update existing document
      Object.assign(settings, updatedData);
    }

    await settings.save();
    res.json({
      success: true,
      message: "Website settings updated",
      data: settings,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating website settings", success: false });
  }
};

module.exports = setLiveKit;
