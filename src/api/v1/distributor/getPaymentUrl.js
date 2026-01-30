const axios = require("axios");
const User = require("../../../models/User");
const Paygic = require("../../../models/Paygic");

const getPaymentUrl = async (req, res, next) => {
  try {
    const { amount, userId, subId, distributorId } = req.body;

    const keys = await Paygic.findOne();

    if (!keys) {
      return res.send({
        success: false,
        message: "Something is wrong",
      });
    }
    // Validate input
    if (!userId || !amount || !subId || !distributorId) {
      return res.status(400).json({ error: "Invalid input" });
    }

    // Update user data in the database
    const user = await User.findOne({ _id: userId });
    const dis = await User.findOne({ _id: distributorId });

    if (!user || !dis) {
      return res.status(404).json({ error: "User or Distributor not found" });
    }

    // Generate a unique receipt ID
    const receiptId = `REC-${Date.now()}-${Math.floor(
      Math.random() * 1000000
    )}`;

    const { data } = await axios.post(
      "https://server.paygic.in/api/v3/createMerchantToken",
      {
        mid: keys.mid,
        password: keys.password,
        expiry: false,
      }
    );

    const { data: response } = await axios.post(
      "https://server.paygic.in/api/v2/createPaymentPage",
      {
        mid: keys.mid, // Merchant ID
        merchantReferenceId: receiptId, // Unique reference ID
        amount: String(amount), // Amount
        customer_mobile: "4355435545",
        customer_name: user.name,
        customer_email: user.email,
        redirect_URL: `${process.env.FRONTEND_URL}/dashboard/success?refId=${receiptId}&subId=${subId}&userId=${userId}&distributorId=${distributorId}`,
        failed_URL: `${process.env.FRONTEND_URL}/distributor/failed`,
      },
      {
        headers: {
          token: data.data.token,
        },
      }
    );
    if (response.status) {
      return res.send({
        success: true,
        payPageUrl: response.data.payPageUrl,
        message: response.msg,
      });
    } else {
      return res.send({
        success: false,
        message: "Same thing error here",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = getPaymentUrl;

