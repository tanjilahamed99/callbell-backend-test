const mongoose = require("mongoose");

const razorpaySchema = new mongoose.Schema({
  key: { type: String },
  secret: { type: String },
});

const Razorpay = mongoose.model("Razorpay", razorpaySchema);

module.exports = Razorpay;
