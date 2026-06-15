const mongoose = require("mongoose");

    const userSchema = new mongoose.Schema({
        name :{type:String , required : true , trim:true},
        email :{type:String , required : true , trim: true , unique:true},
        phone :{type: String , required : true , trim : true , unique :true},
        businessType : {
            type:String , required:true , trim:true
        },
       password:{type:String , required:true},
       resetOtp: String,
       resetOtpExpire: Date,

    }   ,  {timestamps:true})

module.exports = mongoose.model("User" , userSchema);