const mongoose = require("mongoose")


const sourceSchema = new mongoose.Schema({
    userId : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    name:{
        type:String, 
        required:true,
        trim:true,
    },
    description:{
        type:String, 
        default:"",
    },
    isActive:{
        type:Boolean,
        default:true,
    }

})

module.exports = mongoose.model("Source",sourceSchema )