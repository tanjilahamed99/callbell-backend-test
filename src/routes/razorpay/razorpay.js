const Razorpays = require("razorpay");
const router = require("express").Router();
const crypto = require("crypto");
const Website = require("../../models/WebsiteInfo");
const User = require("../../models/User");

router.post("/create-intent", async (req, res) => {
  try {
    const razorpay = new Razorpays({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = req.body;
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send("Error");
    }

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});

router.post("/validate-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    subId,
    userId,
    amount,
  } = req.body;
  const planData = await Website.findOne();

  console.log(req.body);

  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  //order_id + "|" + razorpay_payment_id
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");
  if (digest !== razorpay_signature) {
    return res.status(400).json({ msg: "Transaction is not legit!" });
  }

  const findUser = await User.findById(userId);

  if (!findUser) {
    return res.status(404).send({
      message: "User not found",
      success: false,
    });
  }

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

  const razorpay = {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  };

  if (findUser.transactionHistory.length > 0) {
    updateHistory = [
      ...findUser.transactionHistory,
      {
        razorpay,
        amount,
        paymentMethod: "Razorpay",
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
        razorpay,
        amount,
        paymentMethod: "Razorpay",
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

  await User.findOneAndUpdate({ _id: userId }, update, {
    new: true,
  });

  res.json({
    payment: "success",
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    success: true,
  });
});

module.exports = router;
