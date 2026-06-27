const axios = require("axios");
const User = require("../../../models/User");
const Website = require("../../../models/WebsiteInfo");
const Paygic = require("../../../models/Paygic");

const validatePayment = async (req, res, next) => {
  try {
    const { merchantReferenceId, userId, subId } = req.body;
    const planData = await Website.findOne();
    const keys = await Paygic.findOne();

    if (!keys) {
      return res.send({
        success: false,
        message: "Something is wrong",
      });
    }

    // Basic validation
    if (!merchantReferenceId || !userId) {
      return res.status(400).send({
        message: "merchantReferenceId and userId are required",
        success: false,
      });
    }

    const findUser = await User.findById(userId);

    if (!findUser) {
      return res.status(404).send({
        message: "User not found",
        success: false,
      });
    }

    // Check if merchantReferenceId already exists in user's history
    // Check ALL users if this merchantReferenceId exists
    const idUsed = await User.findOne({
      "transactionHistory.paygic.merchantReferenceId": merchantReferenceId,
    });

    if (idUsed) {
      return res.status(400).send({
        message: "This payment ID has already been processed.",
        success: false,
      });
    }

    // Create merchant token from Paygic
    const { data: tokenData } = await axios.post(
      "https://server.paygic.in/api/v3/createMerchantToken",
      {
        mid: keys.mid,
        password: keys.password,
        expiry: false,
      }
    );

    // Check payment status from Paygic
    const { data: paymentStatus } = await axios.post(
      "https://server.paygic.in/api/v2/checkPaymentStatus",
      {
        mid: keys.mid,
        merchantReferenceId,
      },
      {
        headers: {
          token: tokenData.data.token,
        },
      }
    );

    
    const mainPlan = planData.plan.find((p) => p.id === subId);
    
    if (!mainPlan) {
      return res.status(404).send({
        message: "plan not found",
        success: false,
      });
    }
    
    // Plan details (e.g. duration in days)
    const now = new Date();
    let startDate = now;
    let endDate = new Date();
    const rationDays = mainPlan.duration;

    if (findUser.subscription && findUser.subscription.endDate > now) {
      // User still has active subscription → extend from existing endDate
      startDate = findUser.subscription.startDate;

      // add ration to old endDate
      endDate = new Date(findUser.subscription.endDate);
      endDate.setDate(endDate.getDate() + rationDays);
    } else {
      // No active plan or expired → start from now
      startDate = now;
      endDate.setDate(now.getDate() + rationDays);
    }

    // Build subscription object
    let subscription = {
      plan: mainPlan.name,
      status: "active",
      startDate,
      endDate,
      minute:
        parseFloat(findUser.subscription.minute) + parseInt(mainPlan.minute),
    };

    let updateHistory = [];

    const paygic = {
      merchantReferenceId: paymentStatus?.data?.merchantReferenceId,
      paygicReferenceId: paymentStatus?.data?.paygicReferenceId,
    };

    if (findUser.transactionHistory.length > 0) {
      updateHistory = [
          ...findUser.transactionHistory,
          {
              paygic,
              amount: paymentStatus.data.amount,
              paymentMethod: "Paygic",
              status: "Completed",
              author: {
                  name: findUser.name,
                  email: findUser.email,
                  id: findUser.id,
                  address: findUser.address || "",
              },
              planId: subId,
              plan: mainPlan.name,
              planDuration: mainPlan.duration,
              planMinute: mainPlan.minute,
          },
      ];
    } else {
      updateHistory = [
          {
              paygic,
              amount: paymentStatus.data.amount,
              paymentMethod: "Paygic",
              status: "Completed",
              author: {
                  name: findUser.name,
                  email: findUser.email,
                  id: findUser.id,
                  address: findUser.address || "",
              },
              planId: subId,
              plan: mainPlan.name,
              planDuration: mainPlan.duration,
              planMinute: mainPlan.minute,
          },
      ];
    }
    const update = {
      $set: {
        transactionHistory: updateHistory,
        subscription,
      },
    };

    await User.findOneAndUpdate({ _id: userId }, update, { new: true });

    res.send({
      message: "Payment status checked",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Server error",
      success: false,
      error: error.message,
    });
  }
};

module.exports = validatePayment;
