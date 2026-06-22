const mongoose = require("mongoose");

const razorpaySettingSchema = new mongoose.Schema({
  razorpayKeyId: {
    type: String,
    default: "",
  },
  razorpayKeySecret: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model(
  "RazorpaySetting",
  razorpaySettingSchema
);