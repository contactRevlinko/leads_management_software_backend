const express = require("express")
const router = express.Router()
const Payment = require("../models/paymentModel")

const verifySuperAdminToken = require("../middleware/superAdminVerify");



router.get("/all-admin-package" , verifySuperAdminToken, async(req , res) => {
    try{
const allAdminPackage = await Payment.find()
.populate("adminId" , "name email phone")
.populate("packageId " , "packageName duration price ")
.sort({createdAt : -1})

return res.status(200).json({
    success:true,
    message:"get all admin with package ",
    data:allAdminPackage,

})

    }
    catch(err){
        console.log(err)
        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
})
module.exports = router;