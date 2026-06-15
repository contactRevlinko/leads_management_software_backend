const express = require("express");
const router = express.Router();
const Team = require("../models/teamModel");
const bcrypt = require("bcryptjs");
const verifyUserToken = require("../middleware/auth");
const normalizePhone = require("../utils/phone");


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
module.exports = router;
