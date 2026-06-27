const mongoose = require("mongoose");

const paygicSchema = new mongoose.Schema({
  mid: { type: String },
  password: { type: String },
});

const Paygic = mongoose.model("Paygic", paygicSchema);

module.exports = Paygic;
