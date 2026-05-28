const express = require("express");
const router = express.Router();
const Team = require("../models/teamModel");
const bcrypt = require("bcryptjs");
const verifyUserToken = require("../middleware/auth");

router.post("/create-team-mem", verifyUserToken, async (req, res) => {
  try {
    const { name, phone, email, password, role } = req.body;
    console.log("email of team mem ", req.body.email);
    const existingUser = await Team.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email with this user already register",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashedPassword", hashedPassword);
    const member = await Team.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      userId: req.user._id,
    });
    return res.status(201).json({
      success: true,
      message: "team member created successfully ",
      data: member,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "server error" + " " + err.message,
    });
  }
});

router.get("/all-team", verifyUserToken, async (req, res) => {
  try {
    const members = await Team.find({ userId: req.user._id });
    console.log("all team member", members);
    return res.status(200).json({
      success: true,
      message: "all team member fetch successfully ",
      data: members,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: true,
      message: "server error" + " " + err.message,
    });
  }
});

router.delete("/delete/:id", verifyUserToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMember = await Team.findOneAndDelete({
      _id: id,
      userId: req.user._id,
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
module.exports = router;
