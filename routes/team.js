const express = require("express");
const router = express.Router();
const Team = require("../models/teamModel");
const bcrypt = require("bcryptjs");
const verifyUserToken = require("../middleware/auth");
const normalizePhone = require("../utils/phone");
const jwt = require("jsonwebtoken");



router.post("/create-team-mem", verifyUserToken, async (req, res) => {
  try {
    console.log("CREATE TEAM BODY:", req.body);
    console.log("CREATE TEAM USER ID:", req.user.id);

    const { name, phone1, phone2, email, password, role } = req.body;

    const existingUser = await Team.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email with this user already register",
      });
    }


    
    const hashedPassword = await bcrypt.hash(password, 10);

   const member = await Team.create({
  name,
  email,
  phone1: normalizePhone(phone1),
  phone2: phone2 ? normalizePhone(phone2) : undefined ,
  password: hashedPassword,
  role,
  userId: req.user.id,
});

console.log("CREATED MEMBER:", member);

   

    return res.status(201).json({
      success: true,
      message: "team member created successfully",
      data: member,
    });
  } catch (err) {
    console.log("CREATE TEAM ERROR:", err);
    res.status(500).json({
      success: false,
      message: "server error " + err.message,
    });
  }
});

 router.get("/all-team", verifyUserToken, async (req, res) => {
  try {
    console.log("LOGIN USER ID:", req.user.id);

    const members = await Team.find({ userId: req.user.id });

    console.log("FOUND TEAM:", members);

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.delete("/delete/:id", verifyUserToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMember = await Team.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deletedMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    res.json({
      success: true,
      message: "member deleted",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "server error " + err.message,
    });
  }
});




router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const member = await Team.findOne({ email });

    if (!member) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const isMatch = await bcrypt.compare(password, member.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const token = jwt.sign(
      {
        id: member._id,
        userId:member.userId,
        loginType: "team",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const safeMember = {
      _id: member._id,
      name: member.name,
      email: member.email,
      phone1: member.phone1,
      phone2: member.phone2,
      role: member.role,
      userId: member.userId,
    };

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      data: safeMember,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});



router.put("/change-password", verifyUserToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (req.user.loginType !== "team") {
      return res.status(403).json({
        success: false,
        message: "Only team member can change password here",
      });
    }

    const member = await Team.findById(req.user.teamId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, member.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is wrong",
      });
    }

    member.password = await bcrypt.hash(newPassword, 10);
    await member.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error to change password of team",
    });
  }
});

module.exports = router;
