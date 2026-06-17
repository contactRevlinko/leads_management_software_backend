require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const verifyUserToken = require("../middleware/auth");
const normalizePhone = require("../utils/phone");
const { transporter } = require("../config/emailConfig");

router.post("/register", async (req, res) => {
  try {
    const { name, phone, email, businessType, password } = req.body;
    const existingUser = await User.findOne({ email });
    console.log("existingUser", existingUser);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User Already Exists",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      phone: normalizePhone(phone),
      email,
      businessType,
      password: hashPassword,
    });
    res.status(201).json({
      success: true,
      message: "user created successfully",
      data: user,
    });
    console.log(user, "user");
    console.log(password, hashPassword);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "server error",
      err: err.message,
    });
  }
});

router.post("/login", async (req, res) => {
 
  try {
    const { name, email, phone, password, businessType } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "invalid eamil or password",
      });
    }

     if (!existingUser.isActive) {
  return res.status(403).json({
    success: false,
    message: "Your account is inactive. Contact super admin.",
  })}

    const match = await bcrypt.compare(password, existingUser.password);
    console.log(
      "password",
      password,
      "existingUser.password",
      existingUser.password,
    );

    console.log(match);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "invalid eamil or password",
      });
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        phone: existingUser.phone,
        businessType: existingUser.businessType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" },
    );
    console.log("token", token);
    console.log(User);
    return res.status(200).json({
      success: true,
      message: "user loggedin successfully",
      token: token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        phone: existingUser.phone,
        businessType: existingUser.businessType,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "server error",
      err: err.message,
    });
  }
});

router.get("/profile", verifyUserToken, (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.put("/update-profile", verifyUserToken, async (req, res) => {
  try {
    const { name, email, phone, businessType } = req.body;
    const userId = req.user.id || req.user._id;
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        phone: normalizePhone(phone),
        email,
        businessType,
      },
      { new: true },
    );
    res.status(200).json({
      success: true,
      message: "user profile updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "server error " + " " + err.message,
    });
  }
});

router.put("/change-password", verifyUserToken, async (req, res) => {
  try {
    const { newPassword, currentPassword } = req.body;
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    console.log("user from password", user);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "current password is incorrect",
      });
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "password changed successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "server error" + " " + err.message,
    });
  }
});

//send otp
router.post("/forgot-password", verifyUserToken, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      user.resetOtp = otp;
      user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
      await user.save();

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset OTP",
        html: `
    <h2> Password Reset OTP  </h2>
    <p>Your OTP is:</p>
    <h1> ${otp} </h1>
    <p>This opt is valid for 10 min  </p>  
  `,
      });
      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

//verify otp
router.post("/verify-otp" , verifyUserToken , async(req , res) => {
  try{
    const {email , otp } = req.body ;
    const user = await User.findOne({
      email,
      resetOtp : otp ,
      resetOtpExpire :{$gt : Date.now()},
    })

 if (!user) {
        return res.status(400).json({
          success: false,
          message: "User not found",
        });
      }
     return res.status(200).json({ success: true, message: "OTP verified successfully" });

  }catch(err){
    console.log(err)
    return res.status(500).json({
      success:false,
      messsage:"internal server error",
    })
  }
})

//reset password
router.post("/reset-password" , verifyUserToken , async(req, res) => {
  const {email , otp , newPassword} = req.body;
  try{
    const user = await User.findOne({
    email,
    resetOtp:otp,
    resetOtpExpire: { $gt: Date.now() },
  })
   if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
     await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  }
  catch(err){
    console.log(err)
      res.status(500).json({ success: false, message: err.message });
  }
})

router.get("/check-status", verifyUserToken, async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "User is active",
    user: req.user,
  });
});

module.exports = router;
