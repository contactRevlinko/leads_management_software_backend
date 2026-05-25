const express = require("express");
const router = express.Router();

const Followup = require("../models/followupmodel");
const verifyUserToken = require("../middleware/auth")


router.post("/", verifyUserToken, async (req, res) => {
  try {
    console.log(req.body, "req.body");
    const {
     userId,
      leadId,
      followUpDate,
      followUpTime,
      followUpType,
      notes,
      priority,
      nextFollowupDate,
    } = req.body;
    const followup = await Followup.create({
      userId: req.user.id,
      leadId: leadId,
      followUpDate: followUpDate,
      followUpTime: followUpTime,
      followUpType: followUpType,
      notes: notes,
      priority: priority,
      nextFollowupDate: nextFollowupDate,
    });
    const populatedFollowup = await Followup.findById(followup._id).populate(
      "leadId",
    );
    console.log("followup", followup);
    res.status(201).json({
      success: true,
      message: "followup created successfully",
      data: followup,
      populatedFollowup,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "server error",
      err: err.message,
    });
  }
});

router.get("/",verifyUserToken, async (req, res) => {
  try {
    const allFollowups = await Followup.find({userId : req.user.id})
      .populate("leadId")
      .sort({ followUpDate: 1 });
    res.status(200).json({
      success: true,
      message: "get all followups successfully",
      data: allFollowups,
    });
    console.log(allFollowups, "allFollowups");
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "server error",
      err: err.message,
    });
  }
});

router.get("/lead/:leadId", async (req, res) => {
  try {
    const { leadId } = req.params;
    console.log(req.params.leadId, "leadId come from req.params");
    const followups = await Followup.find({ leadId: leadId }).populate(
      "leadId",
    );
    console.log(followups);
    res.json({
      success: true,
      data: followups,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedFollowup = await Followup.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(201).json({
      success: true,
      message: "followup updated successfully",
      data: updatedFollowup,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      messsage: "server error",
      err: err.message,
    });
  }
});

//wrong date comes from seerver because of time
// router.get('/today' , async(req , res) => {
//   try{

//     const today = new Date();
//     const start = new Date(today.setHours(0,0,0,0));
//     const end = new Date(today.setHours(23,59,59,999));
//    console.log("today : ", today , "start :", start , "end:" ,end )
//     const followups = await Followup.find({
//       followUpDate :  {$gte : start , $lte : end }
//     }).populate("leadId")
//       res.status(200).json({
//         success:true,
//         message: "todays followups get successfully",
//         data : followups ,
//       })
//   }catch(err){
//     console.log(err)
//     res.status(500).json({
//       success:false,
//       message:"server error",
//       err : err.message
//     })
//   }

// })
router.get("/today", async (req, res) => {
  try {
    // const today = new Date().toISOString().split("T")[0]; it will give tomorrows date 
     const today = new Date().toLocaleDateString("en-CA");

    const allFollowups = await Followup.find().populate("leadId");
    const todaysFollowup = allFollowups.filter((item) => {
      if(!item.followUpDate) return false;
     const dbDate = item.followUpDate.toISOString().split("T")[0];

      // const dbDate = item.followUpDate.toLocaleDateString("en-CA");

       console.log("today : ", today, "dbDate : ", dbDate);
      return today === dbDate;
    });
   
    res.status(200).json({
      success: true,
      message: "todays followups get successfully",
      data: todaysFollowup ,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "server error",
      err: err.message,
    });
  }
});

router.delete('/delete/:id', async(req , res) => {
  try{
    const id = req.params.id
    const deletedFollowups = await Followup.findByIdAndDelete(id);
    res.status(200).json({
      success : true ,
      message : "followup deleted successfully "
    })

  }catch(err){
    console.log(err)
    res.status(500).json({
      success : false,
      message : "server error" , 
      err : err.messsage,
    })
  }
})
module.exports = router;
