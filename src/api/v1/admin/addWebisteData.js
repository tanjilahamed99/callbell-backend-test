const Website = require("../../../models/WebsiteInfo");

const addWebsiteData = async (req, res, next) => {
  try {
    const updatedData = req.body;

    let settings = await Website.findOne();
    if (!settings) {
      // If no document exists yet, create it
      settings = new Website(updatedData);
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
    next(error);
  }
};

module.exports = addWebsiteData;
