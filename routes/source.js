const express = require("express");
const router = express.Router();
const Source = require("../models/sourcemodel");
const verifyUserToken = require("../middleware/auth");

router.post("/create" , verifyUserToken , async(req , res) => {
    try{
 const {name , description} = req.body ;
 if(!name){
    return res.status(400).json({
        success:false,
        message:"source name required"
    })
}


const existingSource = await Source.findOne({
    userId:req.user.id,
    name:name.trim(),
})
    if (existingSource) {
      return res.status(400).json({
        success: false,
        message: "Source already exists",
      });
    }

    const source = await Source.create({
      userId: req.user.id,
      name: name.trim(),
      description,
    });
    return res.status(200).json({
        success:true,
        message:"source created successfully",
        data:source,
    })
}

    catch(err){
        console.log(err)
        return res.status(500).json({
            success:false,
            message:"server error to create source"
        })
    }
})

router.get("/all", verifyUserToken, async (req, res) => {
  try {
    const defaultSources = [
      "Instagram",
      "WhatsApp",
      "Referral",
    ];

    let sources = await Source.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

      if (sources.length === 0) {
      const newSources = defaultSources.map((name) => ({
        userId: req.user.id,
        name,
      }));

      await Source.insertMany(newSources);

      sources = await Source.find({ userId: req.user.id }).sort({
        createdAt: -1,
      });
    }

    return res.json({
      success: true,
      data: sources,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
});

router.delete("/delete/:id", verifyUserToken, async (req, res) => {
  try {
    await Source.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    res.json({
      success: true,
      message: "Source deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;