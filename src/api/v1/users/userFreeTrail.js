const User = require("../../../models/User");
const Website = require("../../../models/WebsiteInfo");

const userFreeTrail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { planId } = req.body;

    // Find the user
    const findUser = await User.findById(id);
    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //   id user get already the free then send a error
    if (findUser.subscription.freeTrail) {
      return res.status(301).json({
        message: "Already used the free trail",
        success: false,
      });
    }

    //   check free trail
    const webData = await Website.findOne();
    const freeSub = webData.plan.find((i) => i._id.toString() === planId);
    if (!freeSub) {
      return res.status(404).json({
        success: false,
        message: "free trail not found",
      });
    }

    if (freeSub.price > 0) {
      return res.status(401).json({
        message: "This subscription has" + freeSub.price + " price",
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
      newEndDate.setDate(
        existingEndDate.getDate() + parseInt(freeSub.duration),
      );
    } else {
      // Start fresh from today
      newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + parseInt(freeSub.duration));
    }

    // Build subscription object
    let subscription = {
      plan: freeSub.name,
      status: "active",
      startDate: existingSubscription.startDate || currentDate,
      endDate: newEndDate,
      minute: existingMinutes + parseInt(freeSub.minute),
      freeTrail: true,
    };

    // Create transaction history
    const newTransaction = {
      paymentMethod: "Free Trail",
      status: "Completed",
      author: {
        name: findUser.name,
        email: findUser.email,
        id: findUser.id,
        address: findUser.address || "",
      },
      plan: freeSub.name,
      planMinute: freeSub.minute,
      createdAt: new Date(),
      duration: freeSub.duration,
    };

    // Update user
    const update = {
      $set: {
        subscription: subscription,
      },
      $push: {
        transactionHistory: newTransaction,
      },
    };

    const updatedUser = await User.findByIdAndUpdate(id, update, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Free trail added",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = userFreeTrail;
