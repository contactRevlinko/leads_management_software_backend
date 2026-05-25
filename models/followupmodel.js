const mongoose = require("mongoose");

const followupSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required :true,
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Lead",
    required: true,
  },

  followUpDate:{
    type:Date,
    required:true,
  },
  
    followUpTime : {
      type:String,
    },
    followUpType : {
        type: String ,  
        enum:["Call" , "Meeting" , "WhatsApp" , "Email" ,"Site Visit"],
        default:"Call"
    },
    
    notes:{
        type:String
    },
    priority:{
        type:String,
         enum:["High" , "Medium" , "Low"]
    },
    nextFollowupDate : {
        type:Date,
    } ,
  
}, {timestamps : true});


module.exports = mongoose.model("Followup" , followupSchema) ;
