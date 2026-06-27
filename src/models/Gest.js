const mongoose = require("mongoose");

const gestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: { type: String, required: true },
  ip: { type: String },
  blocked: { type: Boolean, default: false },
});

const Gest = mongoose.model("Gest", gestSchema);

module.exports = Gest;
