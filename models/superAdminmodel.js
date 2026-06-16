const mongoose = require("mongoose");

const superAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "SUPER_ADMIN",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("SuperAdmin", superAdminSchema);
