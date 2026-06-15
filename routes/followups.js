const express = require("express");
const router = express.Router();

const Followup = require("../models/followupmodel");
const verifyUserToken = require("../middleware/auth")
const normalizePhone = require("../utils/phone");

router.post("/creat-followups", verifyUserToken, async (req, res) => {
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
    const lastFollowup = await Followup.findOne({userId : req.user.id}).sort({followupNo : -1})
    const nextFollowupNo = lastFollowup ? lastFollowup.followupNo + 1 : 1 ;
    const followup = await Followup.create({
      userId: req.user.id,
      followupNo: nextFollowupNo,
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

router.post("/get-followups", verifyUserToken, async (req, res) => {
  try {
    const allFollowups = await Followup.find({ userId: req.user.id })
      .populate("leadId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "get all followups successfully",
      data: allFollowups,
    });
  } catch (err) {
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



router.get("/today", verifyUserToken, async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-CA");

    const allFollowups = await Followup.find({
      userId: req.user.id,
    })
      .populate("leadId")
      .sort({ createdAt: -1 });

    const todaysFollowup = allFollowups.filter((item) => {
      if (!item.followUpDate) return false;

      const dbDate = item.followUpDate.toLocaleDateString("en-CA");
      return today === dbDate;
    });

    res.status(200).json({
      success: true,
      message: "todays followups get successfully",
      data: todaysFollowup,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "server error",
      err: err.message,
    });
  }
});



router.delete('/delete/:id', verifyUserToken , async(req , res) => {
  try{
    const id = req.params.id
    const deletedFollowups = await Followup.findByIdAndDelete(id);

     const followups = await Followup.find({
      userId: req.user.id,
    }).sort({
      createdAt: -1,
    });

    for (let i = 0; i < followups.length; i++) {
      followups[i].followupNo = i + 1;
      await followups[i].save();
    }


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
