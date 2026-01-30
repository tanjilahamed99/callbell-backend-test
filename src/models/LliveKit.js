const mongoose = require("mongoose");

const liveKitSchema = new mongoose.Schema({
  url: { type: String },
  secret: { type: String },
  key: { type: String },
});

const LiveKit = mongoose.model("LiveKit", liveKitSchema);

module.exports = LiveKit;
