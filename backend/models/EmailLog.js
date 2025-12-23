const mongoose = require("mongoose");

const EmailLogSchema = new mongoose.Schema(
  {
    subject: String,
    templateName: String,
    html: String,
    toGroup: String,
    totalRecipients: Number,
    successCount: Number,
    failedCount: Number,
    status: {
      type: String,
      enum: ["success", "partial", "failed"],
      default: "success"
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    errorMessage: String
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.EmailLog || mongoose.model("EmailLog", EmailLogSchema);
