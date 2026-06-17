// middleware/superAdminAuth.js

require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifySuperAdminToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Super admin token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only super admin allowed",
      });
    }

    req.superAdmin = decoded;
    console.log(req.superAdmin);

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid super admin token",
    });
  }
};

module.exports = verifySuperAdminToken;