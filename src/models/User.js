const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    // unique: [true, "Email already exist"],
  },
  image: {
    type: String,
  },
  otp: {
    type: String,
  },
  otpExpiresAt: {
    type: Date,
  },
  otpRequestedAt: {
    type: Date,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ["admin", "user", "distributor"],
    default: "user",
  },
  address: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  fcmToken: {
    type: String,
    default: "",
  },
  transactionHistory: [
    {
      amount: { type: Number },
      paymentMethod: { type: String },
      transactionId: { type: String },
      status: { type: String, default: "Pending" },
      createdAt: { type: Date, default: Date.now }, // Optional: add timestamp
      razorpay: { type: Object, default: {} },
      paygic: { type: Object, default: {} },
      author: {
        name: String,
        email: String,
        id: String,
      },
      planId: { type: String },
      plan: { type: String, default: "free" },
      duration: { type: Number, default: 0 },
      planMinute: { type: Number, default: 0 },
    },
  ],
  subscription: {
    plan: { type: String, default: "free" },
    status: { type: String, default: "active" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    minute: {
      type: Number,
      default: 0,
    },
    freeTrail: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now }, // Optional: add timestamp
  distributorStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  referenceBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  busy: { type: Boolean, default: false },

  blockedGuests: [
    {
      guestId: { type: mongoose.Schema.Types.ObjectId, ref: "Gest" },
      blockedAt: { type: Date, default: Date.now },
      guestNumber: { type: String, required: true },
      ip: { type: String },
      gestName: { type: String },
    },
  ],
  callHistory: [
    {
      gestName: { type: String, required: true },
      gestId: { type: String, required: true },
      gestPhone: { type: String, required: true },
      duration: { type: String, required: true },
      time: { type: Date, default: Date.now },
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (this.isNew && this.password) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(this.password, saltRounds);
    this.password = hash;
  }

  if (this.isNew && this.otp) {
    const oneDayLater = new Date();
    oneDayLater.setDate(oneDayLater.getDate() + 1);
    this.otpExpiredDate = oneDayLater;
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
