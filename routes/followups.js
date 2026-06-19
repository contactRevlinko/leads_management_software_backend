const express = require("express");
const router = express.Router();

const Followup = require("../models/followupmodel");
const verifyUserToken = require("../middleware/auth")
const normalizePhone = require("../utils/phone");

router.post("/create-followups", verifyUserToken, async (req, res) => {
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
    const allFollowups = await Followup.find({})
      .populate("leadId")
      .sort({ createdAt: -1 });

    let filteredFollowups = [];

    if (req.user.loginType === "team") {
      console.log("TEAM ID:", req.user.teamId);

      filteredFollowups = allFollowups.filter((item) => {
        const assignedTo = item.leadId?.assignedTo;

        console.log("AssignedTo:", assignedTo);
        console.log("TeamId:", req.user.teamId);

        return (
          assignedTo &&
          String(assignedTo) === String(req.user.teamId)
        );
      });

    } else {
      filteredFollowups = allFollowups.filter(
        (item) => String(item.userId) === String(req.user.id)
      );
    }

    console.log("FINAL COUNT:", filteredFollowups.length);

    return res.json({
      success: true,
      data: filteredFollowups,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
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
    console.log(" LOGIN USER:", req.user);

    const today = new Date().toLocaleDateString("en-CA");
    console.log(" TODAY:", today);

    const allFollowups = await Followup.find({})
      .populate("leadId")
      .sort({ createdAt: -1 });

    console.log("TOTAL FOLLOWUPS:", allFollowups.length);

    let filtered = [];

   
    if (req.user.loginType === "team") {
      console.log(" TEAM LOGIN DETECTED");

      filtered = allFollowups.filter((item) => {
        const lead = item.leadId;
        const assignedTo = lead?.assignedTo;

        const isToday =
          item.followUpDate &&
          new Date(item.followUpDate).toLocaleDateString("en-CA") === today;

        const isAssigned =
          assignedTo &&
          String(assignedTo) === String(req.user.teamId);

        console.log("---- CHECK ----");
        console.log("Followup ID:", item._id);
        console.log("AssignedTo:", assignedTo);
        console.log("TeamId:", req.user.teamId);
        console.log("IsToday:", isToday);
        console.log("IsAssigned:", isAssigned);

        return isToday && isAssigned;
      });
    }

    else {
      console.log(" ADMIN LOGIN DETECTED");

      filtered = allFollowups.filter((item) => {
        const isToday =
          item.followUpDate &&
          new Date(item.followUpDate).toLocaleDateString("en-CA") === today;

        const isOwner =
          String(item.userId) === String(req.user.id);

        console.log("---- ADMIN CHECK ----");
        console.log("Followup ID:", item._id);
        console.log("IsToday:", isToday);
        console.log("IsOwner:", isOwner);

        return isToday && isOwner;
      });
    }

    console.log(" FINAL TODAY COUNT:", filtered.length);

    return res.status(200).json({
      success: true,
      message: "today followups fetched successfully",
      data: filtered,
    });

  } catch (err) {
    console.log(" ERROR:", err);
    return res.status(500).json({
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
