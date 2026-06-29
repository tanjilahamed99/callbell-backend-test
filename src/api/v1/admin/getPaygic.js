const Paygic = require("../../../models/Paygic");
const Razorpay = require("../../../models/Razorpay");
const User = require("../../../models/User");

const getPaygic = async (req, res, next) => {
  try {
    const paygicData = await Paygic.findOne(); // Only one document expected
    const razorpayData = await Razorpay.findOne(); // Only one document expected

    if (!paygicData || !razorpayData) {
      return res
        .status(404)
        .json({ message: "Website settings not found", success: false });
    }

    res.json({
      success: true,
      data: { razorpay: razorpayData, paygic: paygicData },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching website settings", success: false });
  }
};

module.exports = getPaygic;
