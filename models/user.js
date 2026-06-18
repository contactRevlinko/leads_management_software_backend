const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    phone: { type: String, required: true, trim: true, unique: true },
    businessType: {
      type: String,
      required: true,
      trim: true,
    },
    password: { type: String, required: true },

    businessAddress: { type: String,
      //  required: true
       },

    razorpayCustomerId: {
      type: String,
      default: "",
    },

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    paymentVerified: {
      type: Boolean,
      default: false,
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "inactive",
    },

    packageExpiryDate: {
      type: Date,
      default: null,
    },
    packageAssigned: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetOtp: String,
    resetOtpExpire: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
