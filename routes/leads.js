// api routes

const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const Lead = require("../models/leadmodel");
const upload = multer({ storage: multer.memoryStorage() });
const verifyUserToken = require("../middleware/auth");

router.post("/create-lead", verifyUserToken, async (req, res) => {
  try {
    console.log("REQ USER:", req.user);
    console.log("REQ BODY:", req.body);

    const { name, email, phone, status, source, notes, followUpDate } =
      req.body;

    const lead = await Lead.create({
      ...req.body,
      userId: req.user.id,
      name,
      email,
      phone,
      status,
      source,
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
    const leads = await Lead.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      message: "get all leads successfully",
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

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // console.log(id, "lead id");
    const response = await Lead.findByIdAndDelete(id);

    // console.log(response, "response of delete api");

    res.status(200).json({
      success: true,
      message: "lead successfully deleted ",
    });
  } catch (err) {
    res.status(500).json({
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
    console.log("ANALYTICS API HIT");
    const leads = await Lead.find({ userId: req.user.id });

    console.log("LOGIN USER:", req.user.id);
    console.log("MATCHED LEADS:", leads);

    const byStatus = await Lead.aggregate([
      { $match: { userId: leads[0]?.userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const total = leads.length;

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

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
    });
    // console.log(workbook , "workbook")
    const sheetName = workbook.SheetNames[0];
    // console.log(sheetName , "sheetName ");
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    //   console.log(sheetData , "sheetdata");
    const leads = sheetData.map((row) => ({
      name: row.name,
      phone: row.phone,
      email: row.email,
      status: row.status || "New",
      followUpDate:
        row["follow up date"] && row["follow up date"] !== "no date"
          ? new Date(row["follow up date"])
          : null,
    }));

    // const phone = leads.map((lead) => lead.phone);
    // const existingLead = await Lead.find({
    //   phone: { $in: phone },
    // });
    // console.log(existingLead);
    // const newLead = leads.filter((lead) => !existingLead.includes(lead.phone));
    // console.log(newLead);
    // const leadData = await Lead.insertMany(newLead);

    const phones = leads.map((lead) => lead.phone);
    const emails = leads.map((lead) => lead.email);

    const Existinglead = await Lead.find({
      $or: [{ phone: { $in: phones } }, { email: { $in: emails } }],
    });
    const newLead = leads.filter((lead) => {
      const duplicate = Existinglead.find(
        (item) => item.phone === lead.phone || item.email === lead.email,
      );

      return !duplicate;
    });

    if (newLead.length < 1) {
      return res.json({
        message: "same data already exist . no new lead  uploaded",
      });
    }
    const duplicateCount = leads.length - newLead.length;
    const leadData = await Lead.insertMany(newLead);

    res.status(200).json({
      success: true,
      message: `${leadData.length} leads uploaded ${duplicateCount} duplicate lead skipped `,
      data: leadData,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "excel upload failed ",
      error: error.message,
    });
  }
});

router.patch("/:id/status", async (req, res) => {
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

module.exports = router;
