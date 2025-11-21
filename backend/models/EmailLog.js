const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    template: { type: String, required: true },
    html: { type: String },
    toGroup: { type: String, default: "subscribers" },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["success", "failed"], default: "success" },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailLog", emailLogSchema);
