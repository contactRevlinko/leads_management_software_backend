const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone1: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
     phone2: {
      type: String,
    
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Sales Person", "Junior Sales", "Executive"],
      default: "Sales Person",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);