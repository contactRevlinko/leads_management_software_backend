require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const SuperAdmin = require("../models/superAdminmodel");
const verifyUserToken = require("../middleware/auth");
const verifySuperAdminToken = require("../middleware/superAdminVerify");
const bcrypt = require("bcryptjs");
const User = require("../models/user")
// admin (user)routes
const Payment = require("../models/paymentModel");

router.get("/admins" , verifySuperAdminToken,  async(req , res) => {
 try{

const {startDate , endDate} = req.query ;

let filter = {};
if (startDate && endDate) {
  filter.createdAt = {
    $gte: new Date(startDate),
    $lte: new Date(endDate),
  };
}

    const admins = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });


 

    return res.status(200).json({
      success:true,
      message:"successfully fetch admins",
      data:admins,

    })
 }
 catch(err){
  console.log(err)
  return res.status(500).json({
    success:false,
    message:"failed to fetch admins"
  })
 }

})

router.get("/total-amount", verifySuperAdminToken, async (req, res) => {
  try {
    const payments = await Payment.find({ paymentVerified: true });

    const totalAmount = payments.reduce((sum, p) => {
      return sum + (p.packagePrice || 0);
    }, 0);

    res.json({
      success: true,
      totalAmount,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.put(
  "/update-status/:id",
  verifySuperAdminToken,
  async (req, res) => {
    try {
      const admin = await User.findByIdAndUpdate(
        req.params.id,
        { isActive: req.body.isActive },
        { new: true }
      );

      res.json({
        success: true,
        data: admin,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

//super admin routes

router.post("/login-sa", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === "lms@superadmin.com" && password === "Lms@12345") {
      const token = jwt.sign(
        {
          role: "SUPER_ADMIN",
          email: "lms@superadmin.com",
          isMainAdmin: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

    return res.status(200).json({
  success: true,
  message: "Static super admin login successfully",
  token,
  superAdmin: {
    name: "Static Super Admin",
    email: "lms@superadmin.com",
    phone: "-",
    role: "Main Super Admin",
    isMainAdmin: true,
  },
});
    }

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
        isMainAdmin: false,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

 return res.status(200).json({
  success: true,
  message: "Login successfully",
  token,
  superAdmin: {
    id: superAdmin._id,
    name: superAdmin.name,
    email: superAdmin.email,
    phone: superAdmin.phone,
    role: "Super Admin",
    isMainAdmin: superAdmin.isMainAdmin,
  },
});

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error " + err.message,
    });
  }
});

router.post(
  "/create-sa", verifySuperAdminToken,
  async (req, res) => {

    if (!req.superAdmin.isMainAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only Main Super Admin can create admins",
      });
    }

    
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

router.delete("/admin/:id", verifySuperAdminToken, async (req, res) => {
  try {
    const adminId = req.params.id;

    const admin = await User.findById(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    //  STEP ADD THIS (DELETE PAYMENTS FIRST)
    await Payment.deleteMany({ adminId: adminId });

    // THEN DELETE USER
    await User.findByIdAndDelete(adminId);

    return res.status(200).json({
      success: true,
      message: "Admin and payment history deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get(
  "/profile",
  verifySuperAdminToken,
  async (req, res) => {
    return res.status(200).json({
      success: true,
      user: req.superAdmin,
    });
  }
);
module.exports = router;
