require("dotenv").config();

const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Team = require("../models/teamModel");

const verifyUserToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user, token is missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ADMIN LOGIN
    if (decoded.loginType === "admin") {
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Your account is inactive",
        });
      }

      req.user = {
        id: user._id,
        loginType: "admin",
        name: user.name,
        email: user.email,
        phone: user.phone,
        businessType: user.businessType,
      };

      return next();
    }

    // TEAM LOGIN
    if (decoded.loginType === "team") {
      const member = await Team.findById(decoded.id).select("-password");

      if (!member) {
        return res.status(401).json({
          success: false,
          message: "Team member not found",
        });
      }

      req.user = {
        id: member.userId,      // admin user id
        teamId: member._id,    // team member id
        loginType: "team",
        role: member.role,
        name: member.name,
        email: member.email,
        phone1: member.phone1,
        phone2: member.phone2,
      };

      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Invalid login type",
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      err: err.message,
    });
  }
};

module.exports = verifyUserToken;