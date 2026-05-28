const mongoose = require("mongoose");
const teamSchema = new mongoose.Schema([
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Sales Person", "Junior Sales", "Executive"],
      default: "Team",
    },
  },
]);
module.exports = mongoose.model("Team", teamSchema);