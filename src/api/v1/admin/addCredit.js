const User = require("../../../models/User");

const addCredit = async (req, res, next) => {
  try {
    const { userId, userEmail } = req.params;
    const { duration, minute: minutes, subscriptionType } = req.body.data;

    if (!userId || !userEmail) {
      return res.status(400).json({
        success: false,
        message: "User ID and Email required",
      });
    }

    if (!duration || !minutes || !subscriptionType) {
      return res.status(400).json({
        success: false,
        message: "Duration, minutes, and subscription type required",
      });
    }

    // Find the user
    const findUser = await User.findById(userId);

    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get existing subscription details
    const existingSubscription = findUser.subscription || {};
    const existingEndDate = existingSubscription.endDate
      ? new Date(existingSubscription.endDate)
      : new Date();
    const existingMinutes = parseFloat(existingSubscription.minute || 0);
    const currentDate = new Date();

    // Calculate new end date by adding to existing end date if subscription is still active
    // If subscription has expired or doesn't exist, start from today
    let newEndDate;
    if (
      existingSubscription.status === "active" &&
      existingEndDate > currentDate
    ) {
      // Add new duration to existing end date
      newEndDate = new Date(existingEndDate);
      newEndDate.setDate(existingEndDate.getDate() + parseInt(duration));
    } else {
      // Start fresh from today
      newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + parseInt(duration));
    }

    // Build subscription object
    let subscription = {
      plan: subscriptionType,
      status: "active",
      startDate: existingSubscription.startDate || currentDate,
      endDate: newEndDate,
      minute: existingMinutes + parseInt(minutes),
    };

    // Create transaction history
    const newTransaction = {
      paymentMethod: "Admin Credit",
      status: "Completed",
      author: {
        name: findUser.name,
        email: findUser.email,
        id: findUser.id,
        address: findUser.address || "",
      },
      plan: subscriptionType,
      planDuration: duration,
      planMinute: minutes,
      createdAt: new Date(),
    };

    console.log("Subscription update:", subscription);

    // Update user
    const update = {
      $set: {
        subscription: subscription,
      },
      $push: {
        transactionHistory: newTransaction,
      },
    };

    const updatedUser = await User.findByIdAndUpdate(userId, update, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Credits given successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error giving credits:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = addCredit;
