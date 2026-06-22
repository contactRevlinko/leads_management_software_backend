const express = require("express");
const router = express.Router();

const Razorpay = require("razorpay");
const RazorpaySetting = require("../models/razorpaySettingModel");
const verifySuperAdminToken = require("../middleware/superAdminVerify");

router.post("/save", verifySuperAdminToken, async (req, res) => {
  try {
    const { razorpayKeyId, razorpayKeySecret } = req.body;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(400).json({
        success: false,
        message: "Razorpay key id and secret required",
      });
    }

    let setting = await RazorpaySetting.findOne();

    if (setting) {
      setting.razorpayKeyId = razorpayKeyId;
      setting.razorpayKeySecret = razorpayKeySecret;
      await setting.save();
    } else {
      setting = await RazorpaySetting.create({
        razorpayKeyId,
        razorpayKeySecret,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Razorpay setting saved successfully",
      data: setting,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
});

router.get("/get", verifySuperAdminToken, async (req, res) => {
  try {
    const setting = await RazorpaySetting.findOne();

    return res.status(200).json({
      success: true,
      message: "Razorpay settings fetched successfully",
      data: setting,
    });
  } catch (err) {
    console.log("Get Razorpay setting error:", err);
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount, packageId } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    const setting = await RazorpaySetting.findOne();

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Razorpay setting not found",
      });
    }

  const razorpayInstance = new Razorpay({
  key_id: setting.razorpayKeyId,
  key_secret: setting.razorpayKeySecret,
});

    const order = await razorpayInstance.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      order,
      key: setting.razorpayKeyId,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
});

module.exports = router;