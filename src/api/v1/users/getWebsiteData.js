const Website = require("../../../models/WebsiteInfo");

const getWebsiteData = async (req, res, next) => {
  try {
    const settings = await Website.findOne(); // Only one document expected
    if (!settings) {
      return res
        .status(404)
        .json({ message: "Website settings not found", success: false });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching website settings", success: false });
  }
};

module.exports = getWebsiteData;
