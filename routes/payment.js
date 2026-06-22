const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const Payment = require("../models/paymentModel");
const User = require("../models/user");
const Package = require("../models/packageModel");
const RazorpaySetting = require("../models/razorpaySettingModel");

// Get all payment history
router.get("/all-admin-package", async (req, res) => {
  try {
    const allAdminPackage = await Payment.find()
      .populate("adminId", "name email phone packageExpiryDate")
      .populate("packageId", "packageName duration price")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Get all admin with package",
      data: allAdminPackage,
    });
  } catch (err) {
    console.log("Get payment history error:", err);
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
});

// Verify Razorpay payment
router.post("/verify-payment", async (req, res) => {
  try {
    console.log("VERIFY PAYMENT API HIT");
    console.log("Body:", req.body);

    const {
      userId,
      packageId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !userId ||
      !packageId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification data missing",
      });
    }

    const setting = await RazorpaySetting.findOne();

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Razorpay setting not found",
      });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", setting.razorpayKeySecret)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const selectedPackage = await Package.findById(packageId);

    if (!selectedPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const expiryDate = new Date();

    if (selectedPackage.durationInDays) {
      expiryDate.setDate(
        expiryDate.getDate() + Number(selectedPackage.durationInDays)
      );
    } else {
      expiryDate.setDate(expiryDate.getDate() + 30);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        paymentVerified: true,
        subscriptionStatus: "active",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        packageAssigned: selectedPackage.packageName,
        packageExpiryDate: expiryDate,
        isActive: true,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const paymentHistory = await Payment.create({
      adminId: userId,
      packageId: packageId,
      packageName: selectedPackage.packageName,
      packagePrice: selectedPackage.price,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paymentVerified: true,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      user,
      paymentHistory,
    });
  } catch (err) {
    console.log("Verify payment error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Payment verification failed",
    });
  }
});

module.exports = router;