const Paygic = require("../../../models/Paygic");
const Razorpay = require("../../../models/Razorpay");

const setPaygic = async (req, res, next) => {
  try {
    const { type, ...rest } = req.body;

    if (type === "paygic") {
      let settings = await Paygic.findOne();
      if (!settings) {
        // If no document exists yet, create it
        settings = new Paygic(rest);
      } else {
        // Update existing document
        Object.assign(settings, rest);
      }
      await settings.save();
      return res.json({
        success: true,
        message: "Website settings updated",
        data: settings,
      });
    } else if (type === "razorpay") {
      let settings = await Razorpay.findOne();
      if (!settings) {
        // If no document exists yet, create it
        settings = new Razorpay(rest);
      } else {
        // Update existing document
        Object.assign(settings, rest);
      }
      await settings.save();
      return res.json({
        success: true,
        message: "Website settings updated",
        data: settings,
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating website settings", success: false });
  }
};

module.exports = setPaygic;
