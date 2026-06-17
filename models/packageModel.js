const mongoose = require("mongoose");
const packageSchema = new mongoose.Schema({
  packageName: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: String,
    required: true,
    trim: true,
  },
  durationInDays: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});
module.exports = mongoose.model("Package", packageSchema);
