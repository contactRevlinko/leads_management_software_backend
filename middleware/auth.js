require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

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
      name: user.name,
      email: user.email,
      phone: user.phone,
      businessType: user.businessType,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      err: err.message,
    });
  }
};


const verifiedSuperAdmin = (req , res , next) => {
    if(req.user.role !== "SUPER_ADMIN"){
        return res.status(403).json({
            success:false,
            message:"Access denied , only super admin allowed "
        })
    }
    next();
}

module.exports = verifyUserToken;
