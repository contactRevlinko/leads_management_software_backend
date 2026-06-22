// api routes
const Followup = require("../models/followupmodel");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const Lead = require("../models/leadmodel");
const upload = multer({ storage: multer.memoryStorage() });
const verifyUserToken = require("../middleware/auth");
const normalizePhone = require("../utils/phone");


router.post("/create-lead", verifyUserToken, async (req, res) => {
  try {
    console.log("REQ USER:", req.user);
    console.log("REQ BODY:", req.body);

    const { name, email, phone, status, source, assignedTo, notes, followUpDate } =
  req.body;

  
  const lastLead = await Lead.findOne({
  userId: req.user.id,
}).sort({ leadNo: -1 });

console.log("Last Lead:", lastLead);

const nextLeadNo = lastLead ? lastLead.leadNo + 1 : 1;

console.log("Next Lead No:", nextLeadNo);

const lead = await Lead.create({
  userId: req.user.id,
  leadNo: nextLeadNo,
  name,
  email,
  phone: normalizePhone(phone),
  status,
  source,
   assignedTo: assignedTo || null,
  notes,
  followUpDate,
});  

    res.status(201).json({
      success: true,
      message: "lead created successfully",
      data: lead,
    });
  } catch (err) {
    console.log("LEAD CREATE ERROR:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/get-leads", verifyUserToken, async (req, res) => {
  try {
    let filter;

    if (req.user.loginType === "team") {
      filter = {
        userId: req.user.id,        // admin id
        assignedTo: req.user.teamId // team member id
      };
    } else {
      filter = {
        userId: req.user.id,
      };
    }

    console.log("REQ USER:", req.user);
    console.log("LEAD FILTER:", filter);

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .populate("assignedTo", "name email role");

    res.status(200).json({
      success: true,
      data: leads,
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
    const updatedLead = await Lead.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({
      success: true,
      message: "lead successfully updated",
      data: updatedLead,
    });
  } catch (err) {
    res.status(400).json({
      sucess: false,
      message: err.message,
    });
  }
});



router.delete("/:id", verifyUserToken, async (req, res) => {
  try {
    const leadId = req.params.id;

    // delete all followups of this lead
    await Followup.deleteMany({
      leadId: leadId,
    });

    // delete lead
    await Lead.findByIdAndDelete(leadId);

   const leads = await Lead.find({ userId: req.user.id }).sort({
      createdAt: 1,
    });

    for (let i = 0; i < leads.length; i++) {
      leads[i].leadNo = i + 1;
      await leads[i].save();
    }

    res.status(200).json({
      success: true,
      message: "Lead and related followups deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}); 

router.get("/reminders/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const leads = await Lead.find({
      followUpDate: { $lte: today },
      status: { $nin: ["Closed Won ", "Closed Lost "] },
    }).sort({ followUpDate: 1 });

    console.log(leads, "leads");

    res.status(200).json({
      success: true,
      message: "get leads as per followUpDate and status",
      data: leads,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: err.message + "server error",
    });
  }
});



router.get("/analytics", verifyUserToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const byStatus = await Lead.aggregate([
      { $match: { userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const total = await Lead.countDocuments({ userId });

    res.json({
      success: true,
      byStatus,
      total,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});  



router.get("/source", verifyUserToken, async (req, res) => {
  try {
    const leads = await Lead.find({ userId: req.user.id });
    console.log("/login user", req.user.id);
    console.log("MATCHED LEADS:", leads);
    
    const source = await Lead.aggregate([
      { $match: { userId: leads[0]?.userId} },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
    ]);
    const total = leads.length;

    res.json({
      success: true,
      source,
      total,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/upload", verifyUserToken, upload.single("file"), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
      cellDates: true,
    });

    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const validSources = [
      "Whatsapp",
      "Instagram",
      "Referral",
      "Website",
      "Facebook",
      "Call",
      "Email",
      "Telegram",
      "Friend",
      "Other",
    ];

    const validStatus = [
      "New",
      "Hot",
      "Warm",
      "Cold",
      "Contacted",
      "Interested",
      "Closed Won",
      "Closed Lost",
    ];

    const leads = sheetData.map((row) => {
      const sourceValue = row.source
        ? String(row.source).trim()
        : "Other";

      const statusValue = row.status
        ? String(row.status).trim()
        : "New";

      return {
        userId: req.user.id,
        name: row.name,
        phone: String(row.phone || "").trim(),
        email: row.email,
        status: validStatus.includes(statusValue) ? statusValue : "New",
        source: validSources.includes(sourceValue) ? sourceValue : "Other",
        followUpDate: row.followUpDate ? new Date(row.followUpDate) : null,
      };
    });

    const phones = leads.map((lead) => lead.phone);
    const emails = leads.map((lead) => lead.email);

    const existingLead = await Lead.find({
      userId: req.user.id,
      $or: [{ phone: { $in: phones } }, { email: { $in: emails } }],
    });

    const newLead = leads.filter((lead) => {
      const duplicate = existingLead.find(
        (item) => item.phone === lead.phone || item.email === lead.email
      );

      return !duplicate;
    });

    if (newLead.length < 1) {
      return res.json({
        success: true,
        message: "same data already exist. no new lead uploaded",
      });
    }

    const duplicateCount = leads.length - newLead.length;

    // Get the last leadNo for this user to auto-increment
    const lastLead = await Lead.findOne({ userId: req.user.id }).sort({ leadNo: -1 });
    let nextLeadNo = lastLead && lastLead.leadNo ? lastLead.leadNo + 1 : 1;

    // Assign leadNo to each new lead
    newLead.forEach((lead) => {
      lead.leadNo = nextLeadNo++;
    });

    const leadData = await Lead.insertMany(newLead);

    res.status(200).json({
      success: true,
      message: `${leadData.length} leads uploaded, ${duplicateCount} duplicate lead skipped`,
      data: leadData,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "excel upload failed",
      error: error.message,
    });
  }
});




router.patch("/:id/status", verifyUserToken, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedLeadStatus = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    res.status(201).json({
      success: true,
      message: "lead status updated successfully",
      data: updatedLeadStatus,
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
router.put("/:id/assign-lead" , verifyUserToken , async(req,res) => {
try{
    const {assignedTo} = req.body ;
  const lead =  await Lead.findOneAndUpdate({
    _id:req.params.id,
    userId:req.user.id,
  },
{
  assignedTo:assignedTo || null,
}, {new :true}).populate("assignedTo" , "name email role")
 return res.json(200).json({
  success:true,
  message:"lead assigned successfully ",
  data:lead,
 })

}catch(err){
  console.log(err)
  return res.status(500).json({
    success:false,
    message :"server error"+ " " + err.message
  })
}

})


module.exports = router;
