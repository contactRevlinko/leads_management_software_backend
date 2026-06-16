require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const SuperAdmin = require("../models/superAdminmodel");
const verifyUserToken = require("../middleware/auth");
const verifySuperAdminToken = require("../middleware/superAdminVerify");
const bcrypt = require("bcryptjs");

router.post("/login-sa", async (req, res) => {
  try {
    const { email, password } = req.body;

    // static super admin login
    if (email === "lms@superadmin.com" && password === "Lms@123") {
      const token = jwt.sign(
        {
          role: "SUPER_ADMIN",
          email: "lms@superadmin.com",
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.status(200).json({
        success: true,
        message: "Static super admin login successfully",
        token,
        user: {
          role: "SUPER_ADMIN",
          email: "lms@superadmin.com",
        },
      });
    }

    // database super admin login
    const superAdmin = await SuperAdmin.findOne({ email });

    if (!superAdmin) {
      return res.status(401).json({
        success: false,
        message: "invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, superAdmin.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: superAdmin._id,
        role: superAdmin.role,
        email: superAdmin.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      message: "Super admin login successfully",
      token,
      user: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        phone: superAdmin.phone,
        role: superAdmin.role,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "server error " + err.message,
    });
  }
});

router.post(
  "/create-sa", verifySuperAdminToken,
  async (req, res) => {
    try {
      const { name, phone, email, password } = req.body;
      const existSuperAdmin = await SuperAdmin.findOne({
        $or: [{ email }, { phone }],
      });

      if (existSuperAdmin) {
        return res.status(400).json({
          success: false,
          message: "email or phone already exist ",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const superAdmin = await SuperAdmin.create({
        name,
        phone,
        email,
        password: hashedPassword,
      });
      res.status(200).json({
        success: true,
        message: "super admin created successfully ",
        superAdmin: {
          id: superAdmin._id,
          name: superAdmin.name,
          email: superAdmin.email,
          phone: superAdmin.phone,
          role: superAdmin.role,
          isActive: superAdmin.isActive,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "server error" + "" + err.message,
      });
    }
  },
);


router.get("/all-sa" , verifySuperAdminToken  , async(req , res) => {
  try{
    const superAdmin = await SuperAdmin.find().select("-password").sort({createdAt : -1});
    res.status(200).json({
      success:true , 
      message :"get all super admin",
      superAdmin,
    })


  }
  catch(err){
    console.log(err)
    return res.status(500).json({
      success:false,
      message:"server error " + "" + err.message
    })
  }
})

router.put("/update-sa/:id" , verifySuperAdminToken , async(req, res) => {
  try{
    const {name , phone , email} = req.body;
    const superAdmin = await SuperAdmin.findByIdAndUpdate( 
      req.params.id , {name ,phone , email},{new:true}
    ).select("-password")

    if(!superAdmin){
      return res.status(404).json({
        success:false, 
        message:"superAdmin not found",
    
      })
    }
     res.status(200).json({
      success: true,
      message: "Super admin updated successfully",
      superAdmin,
    });
 
  }catch(err){
    console.log(err)
    return res.status(500).json({
      success:false,
      message:"server err" + " " + err.message
    })
  }
})

router.patch("/toggle-sa/:id" , verifySuperAdminToken , async(req,res) => {
  try{
    const superAdmin = await SuperAdmin.findByIdAndUpdate(req.params.id)
    if(!superAdmin){
      return res.status(404).json({
        success:false,
        message:"super Admin not found"
      })
    }
    superAdmin.isActive = !superAdmin.isActive
    await superAdmin.save();

   return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      isActive: superAdmin.isActive,
    });
  }
  catch(err){
    console.log(err)
    return res.status(500).json({
      success:false,
      message:"server error" + " " + err.message
    })
  }
})


router.delete("/delete-sa/:id" , verifySuperAdminToken , async(req , res) => {
  try {
const superAdmin = await SuperAdmin.findByIdAndDelete(req.params.id)
if(!superAdmin){
  return res.status(404).json({
    success:flase,
    message :"super admin not found"
  })
}
res.status(200).json({
  success:true ,
  message:"super admin deleted successfully"
})
  }
  catch(err){
    console.log(err)
    return res.status(500).json({
      success:flase,
      message:"server error" +" " + err.message 
    })
  }
} )


module.exports = router;
