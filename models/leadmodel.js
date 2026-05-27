//mongoSchema

const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Hot",
        "Warm",
        "Cold",
        "Interested",
        "Closed Won",
        "Closed Lost",
      ],
      default: "New",
    },
    source: {
      type: String,
      enum: [
        "Whatsapp",
        "Instagram",
        "Referral",
        "Website",
        "Facebook",
        "Call",
        "Email",
        "Telegram",
        "Other",
        "Friend",
        "Campaign",
      ],
      default: "other",
    },
    followUpDate: {
      type: Date,
    },
    notes: { type: String },
    assignedTo: { type: String },
  },
  { timestamps: true }, // createdAt and updatedAt document
);
module.exports = mongoose.model("Lead", leadSchema);
