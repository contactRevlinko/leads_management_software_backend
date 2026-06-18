const express = require("express");
const router = express.Router();
const Package = require("../models/packageModel");

const verifySuperAdminToken = require("../middleware/superAdminVerify");

router.post("/create-package", verifySuperAdminToken, async (req, res) => {
  try {
    const { packageName, description, price, duration, durationInDays } =
      req.body;
    if (!packageName || !price || !duration || !durationInDays) {
      return res.status(400).json({
        success: false,
        message: "Package name, price, duration and durationInDays required",
      });
    }
    const newPackge = await Package.create({
      packageName,
      description,
      price,
      duration,
      durationInDays,
    });

    return res.status(201).json({
      success: true,
      message: "package created successfully",
      data: newPackge,
    });
  } catch (err) {
    console.log("Create package error:", err);
    return res.status(500).json({
      success: false,
      message: "server error" + " " + err.message,
    });
  }
});

router.get("/all-package", async (req, res) => {
  try {
  const getAllPackage = await Package.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "get all package sucessfully",
      data: getAllPackage,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
});

router.put("/update-package/:id", verifySuperAdminToken, async (req, res) => {
  try {
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "package updated ",
      data: updatedPackage,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
});

router.patch("/toggle-package/:id", verifySuperAdminToken, async (req, res) => {
  try {
    const packageData = await Package.findById(req.params.id);

    if (!packageData) {
      return res.status(500).json({
        success: false,
        message: "package not found",
      });
    }
    packageData.isActive = !packageData.isActive;
    await packageData.save();

    return res.status(200).json({
        success:true,
        message:"package status updated",
        data:packageData,
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
});

router.delete("/delete-package/:id" , verifySuperAdminToken , async(req , res) => {
    try{
        const deletePackage = await Package.findByIdAndDelete(req.params.id)
        if(!deletePackage){
            return res.status(404).json({
                success:flase,
                message:"package not found",
            })

        }
    return res.status(200).json({
      success: true,
      message: "Package deleted successfully",
    });


    }catch(err){
        console.log(err)
        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
})
module.exports = router;
