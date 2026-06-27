const mongoose = require("mongoose");

const WebsiteSchema = new mongoose.Schema({
  about: {},
  privacy: {},
  contactUs: {},
  termsAndCondition: {},
  paymentMethod: {
    paygic: { type: Boolean, default: true },
    razorPay: { type: Boolean, default: true },
  },
  plan: [
    {
      duration: { type: Number, required: true },
      price: { type: Number, required: true },
      name: { type: String, required: true },
      minute: { type: Number, required: true },
      createdAt: { type: Date, default: Date.now }, // Optional: add timestamp
    },
  ],
  distributorCommission: {
    type: Number,
  },
});

const Website = mongoose.model("Website", WebsiteSchema);

module.exports = Website;
