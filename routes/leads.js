// // api routes

// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const XLSX = require("xlsx");
// const Lead = require("../models/leadmodel");
// const upload = multer({ storage: multer.memoryStorage() });
// const verifyUserToken = require("../middleware/auth");

// router.post("/create-lead", verifyUserToken, async (req, res) => {
//   try {
//     console.log("REQ USER:", req.user);
//     console.log("REQ BODY:", req.body);

//     const { name, email, phone, status, notes, followUpDate } = req.body;

//     const lead = await Lead.create({
//       userId: req.user.id,
//       name,
//       email,
//       phone,
//       status,
//       notes,
//       followUpDate,
//     });

//     res.status(201).json({
//       success: true,
//       message: "lead created successfully",
//       data: lead,
//     });
//   } catch (err) {
//     console.log("LEAD CREATE ERROR:", err.message);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// });

// router.post("/get-leads", verifyUserToken  , async (req, res) => {
//   try {
//     const leads = await Lead.find({userId: req.user.id }).sort({ createdAt: -1 });
//     res.status(200).json({
//       success: true,
//       message: "get all leads successfully",
//       data: leads,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// });

// router.put("/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     const updatedLead = await Lead.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     res.status(200).json({
//       success: true,
//       message: "lead successfully updated",
//       data: updatedLead,
//     });
//   } catch (err) {
//     res.status(400).json({
//       sucess: false,
//       message: err.message,
//     });
//   }
// });

// router.delete("/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     // console.log(id, "lead id");
//     const response = await Lead.findByIdAndDelete(id);

//     // console.log(response, "response of delete api");

//     res.status(200).json({
//       success: true,
//       message: "lead successfully deleted ",
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: err.message,
//     });
//   }
// });

// router.get("/reminders/today", async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(23, 59, 59, 999);
//     const leads = await Lead.find({
//       followUpDate: { $lte: today },
//       status: { $nin: ["Closed Won ", "Closed Lost "] },
//     }).sort({ followUpDate: 1 });

//     console.log(leads, "leads");

//     res.status(200).json({
//       success: true,
//       message: "get leads as per followUpDate and status",
//       data: leads,
//     });
//   } catch (err) {
//     console.log(err.message);
//     return res.status(500).json({
//       success: false,
//       message: err.message + "server error",
//     });
//   }
// });

// router.get("/analytics/summary", async (req, res) => {
//   try {
//     const byStatus = await Lead.aggregate([
//       {
//         $group: { _id: "$status", count: { $sum: 1 } },
//       },
//     ]);
//     console.log(byStatus);
//     const total = await Lead.countDocuments();
//     res.status(200).json({
//       success: true,
//       byStatus,
//       total,
//     });
//     console.log(total);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       success: false,
//       message: err.message + "server error",
//     });
//   }
// });

// router.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     const workbook = XLSX.read(req.file.buffer, {
//       type: "buffer",
//     });
//     // console.log(workbook , "workbook")
//     const sheetName = workbook.SheetNames[0];
//     // console.log(sheetName , "sheetName ");
//     const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
//     //   console.log(sheetData , "sheetdata");
//     const leads = sheetData.map((row) => ({
//       name: row.name,
//       phone: row.phone,
//       email: row.email,
//       status: row.status || "New",
//       followUpDate:
//         row["follow up date"] && row["follow up date"] !== "no date"
//           ? new Date(row["follow up date"])
//           : null,
//     }));

//     // const phone = leads.map((lead) => lead.phone);
//     // const existingLead = await Lead.find({
//     //   phone: { $in: phone },
//     // });
//     // console.log(existingLead);
//     // const newLead = leads.filter((lead) => !existingLead.includes(lead.phone));
//     // console.log(newLead);
//     // const leadData = await Lead.insertMany(newLead);

//     const phones = leads.map((lead) => lead.phone);
//     const emails = leads.map((lead) => lead.email);

//     const Existinglead = await Lead.find({
//       $or: [{ phone: { $in: phones } }, { email: { $in: emails } }],
//     });
//     const newLead = leads.filter((lead) => {
//       const duplicate = Existinglead.find(
//         (item) => item.phone === lead.phone || item.email === lead.email,
//       );

//       return !duplicate;
//     });

//     if(newLead.length < 1){
//       return res.json({
//         message : "same data already exist . no new lead  uploaded"
//       })
//     }
//  const duplicateCount = leads.length - newLead.length
//  const leadData = await Lead.insertMany(newLead); 
   
//  res.status(200).json({
//       success: true,
//       message: `${leadData.length} leads uploaded ${duplicateCount} duplicate lead skipped `,
//       data: leadData,
//     });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({
//       success: false,
//       message: "excel upload failed ",
//       error: error.message,
//     });
//   }
// });

// router.post("/count",verifyUserToken, async (req, res) => {
//   try {
//     const totalLead = await Lead.countDocuments({userId : req.user.id});
//     res.status(200).json({
//       success: true,
//       message: "lead count successfully",
//       totalLead,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       success: false,
//       message: "server error",
//       err: err.message,
//     });
//   }
// });

// router.post("/new",verifyUserToken, async (req, res) => {
//   try {
//     const newStatus = await Lead.countDocuments({
//     userId : req.user.id,
//       status: "New",
//     });
//     res.status(200).json({
//       success: true,
//       message: "lead count of status new",
//       newStatus,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       success: false,
//       message: "server error",
//       err: err.message,
//     });
//   }
// });

// router.post("/interested", verifyUserToken,async (req, res) => {
//   try {
//     const interested = await Lead.countDocuments({
//        userId : req.user.id,
//       status: "Interested",
//     });
//     res.status(200).json({
//       success: false,
//       message: "lead count of status interested",
//       interested,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       success: false,
//       message: "server error",
//     });
//   }
// });

// router.post("/contacted",verifyUserToken, async (req, res) => {
//   try {
//     const contacted = await Lead.countDocuments({
//        userId : req.user.id,
//       status: "Contacted",
//     });
//     res.status(200).json({
//       success: false,
//       message: "lead count of status contacted",
//       contacted,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       success: false,
//       message: "server error",
//     });
//   }
// });

// router.post("/won",verifyUserToken ,async (req, res) => {
//   try {
//     const won = await Lead.countDocuments({
//        userId : req.user.id,
//       status: "Closed Won",
//     });
//     res.status(200).json({
//       success: false,
//       message: "lead count of status Closed Won",
//       won,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       success: false,
//       message: "server error",
//     });
//   }
// });

// router.post("/lost",verifyUserToken, async (req, res) => {
//   try {
//     const lost = await Lead.countDocuments({
//        userId : req.user.id,
//       status: "Closed Lost",
//     });
//     res.status(200).json({
//       success: false,
//       message: "lead count of status Lost",
//       lost,
//     });
//     //   console.log(lost)
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       success: false,
//       message: "server error",
//     });
//   }
// });

// router.patch('/:id/status' , async (req , res) => {
//   try{
//     const {status } = req.body;
//     const updatedLeadStatus = await Lead.findByIdAndUpdate(req.params.id , {status} , {new : true});
//     res.status(201).json({
//       success :true ,
//       message : "lead status updated successfully",
//       data:updatedLeadStatus
//     })

//   }catch(err){
//     console.log(err);
//     res.status(500).json({
//       success : false ,
//       message : "server error",
//       err : err.message 
//     })
//   }

// })

// module.exports = router;


const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");

const Lead = require("../models/leadmodel");
const verifyUserToken = require("../middleware/auth");

const upload = multer({ storage: multer.memoryStorage() });

const getUserId = (req) => req.user?.id || req.user?._id;

// CREATE LEAD
router.post("/create-lead", verifyUserToken, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found from token",
      });
    }

    const { name, email, phone, status, notes, followUpDate } = req.body;

    const lead = await Lead.create({
      userId,
      name,
      email,
      phone,
      status: status || "New",
      notes,
      followUpDate: followUpDate || null,
    });

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (err) {
    console.log("CREATE LEAD ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// GET USER LEADS
router.post("/get-leads", verifyUserToken, async (req, res) => {
  try {
    const userId = getUserId(req);

    const leads = await Lead.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Leads fetched successfully",
      data: leads || [],
    });
  } catch (err) {
    console.log("GET LEADS ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      data: [],
    });
  }
});

// UPDATE LEAD
router.put("/:id", verifyUserToken, async (req, res) => {
  try {
    const userId = getUserId(req);

    const updatedLead = await Lead.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });
  } catch (err) {
    console.log("UPDATE LEAD ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// DELETE LEAD
router.delete("/:id", verifyUserToken, async (req, res) => {
  try {
    const userId = getUserId(req);

    const deletedLead = await Lead.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!deletedLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (err) {
    console.log("DELETE LEAD ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// TODAY REMINDERS
router.get("/reminders/today", verifyUserToken, async (req, res) => {
  try {
    const userId = getUserId(req);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const leads = await Lead.find({
      userId,
      followUpDate: { $lte: today },
      status: { $nin: ["Closed Won", "Closed Lost"] },
    }).sort({ followUpDate: 1 });

    res.status(200).json({
      success: true,
      message: "Today reminders fetched successfully",
      data: leads || [],
    });
  } catch (err) {
    console.log("TODAY REMINDER ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      data: [],
    });
  }
});

// ANALYTICS
router.get("/analytics/summary", verifyUserToken, async (req, res) => {
  try {
    const userId = getUserId(req);

    const byStatus = await Lead.aggregate([
      { $match: { userId: new Lead.base.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const total = await Lead.countDocuments({ userId });

    res.status(200).json({
      success: true,
      byStatus: byStatus || [],
      total: total || 0,
    });
  } catch (err) {
    console.log("ANALYTICS ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      byStatus: [],
      total: 0,
    });
  }
});

// UPLOAD EXCEL
router.post("/upload", verifyUserToken, upload.single("file"), async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const leads = sheetData.map((row) => ({
      userId,
      name: row.name || row.Name || "",
      phone: row.phone || row.Phone || "",
      email: row.email || row.Email || "",
      status: row.status || row.Status || "New",
      followUpDate:
        row["follow up date"] || row.followUpDate
          ? new Date(row["follow up date"] || row.followUpDate)
          : null,
    }));

    const phones = leads.map((lead) => lead.phone).filter(Boolean);
    const emails = leads.map((lead) => lead.email).filter(Boolean);

    const existingLeads = await Lead.find({
      userId,
      $or: [{ phone: { $in: phones } }, { email: { $in: emails } }],
    });

    const newLeads = leads.filter((lead) => {
      return !existingLeads.some(
        (item) => item.phone === lead.phone || item.email === lead.email
      );
    });

    if (newLeads.length < 1) {
      return res.status(200).json({
        success: true,
        message: "Same data already exists. No new lead uploaded.",
        data: [],
      });
    }

    const leadData = await Lead.insertMany(newLeads);
    const duplicateCount = leads.length - newLeads.length;

    res.status(200).json({
      success: true,
      message: `${leadData.length} leads uploaded, ${duplicateCount} duplicate leads skipped`,
      data: leadData,
    });
  } catch (err) {
    console.log("UPLOAD ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// COUNTS
router.post("/count", verifyUserToken, async (req, res) => {
  try {
    const totalLead = await Lead.countDocuments({ userId: getUserId(req) });

    res.status(200).json({
      success: true,
      totalLead,
    });
  } catch (err) {
    console.log("COUNT ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      totalLead: 0,
    });
  }
});

router.post("/new", verifyUserToken, async (req, res) => {
  try {
    const newStatus = await Lead.countDocuments({
      userId: getUserId(req),
      status: "New",
    });

    res.status(200).json({
      success: true,
      newStatus,
    });
  } catch (err) {
    console.log("NEW STATUS ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      newStatus: 0,
    });
  }
});

router.post("/interested", verifyUserToken, async (req, res) => {
  try {
    const interested = await Lead.countDocuments({
      userId: getUserId(req),
      status: "Interested",
    });

    res.status(200).json({
      success: true,
      interested,
    });
  } catch (err) {
    console.log("INTERESTED ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      interested: 0,
    });
  }
});

router.post("/contacted", verifyUserToken, async (req, res) => {
  try {
    const contacted = await Lead.countDocuments({
      userId: getUserId(req),
      status: "Contacted",
    });

    res.status(200).json({
      success: true,
      contacted,
    });
  } catch (err) {
    console.log("CONTACTED ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      contacted: 0,
    });
  }
});

router.post("/won", verifyUserToken, async (req, res) => {
  try {
    const won = await Lead.countDocuments({
      userId: getUserId(req),
      status: "Closed Won",
    });

    res.status(200).json({
      success: true,
      won,
    });
  } catch (err) {
    console.log("WON ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      won: 0,
    });
  }
});

router.post("/lost", verifyUserToken, async (req, res) => {
  try {
    const lost = await Lead.countDocuments({
      userId: getUserId(req),
      status: "Closed Lost",
    });

    res.status(200).json({
      success: true,
      lost,
    });
  } catch (err) {
    console.log("LOST ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
      lost: 0,
    });
  }
});

// UPDATE STATUS
router.patch("/:id/status", verifyUserToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { status } = req.body;

    const updatedLeadStatus = await Lead.findOneAndUpdate(
      { _id: req.params.id, userId },
      { status },
      { new: true }
    );

    if (!updatedLeadStatus) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      data: updatedLeadStatus,
    });
  } catch (err) {
    console.log("STATUS UPDATE ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;