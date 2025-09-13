import mongoose from "mongoose";

const scriptSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    systemMessage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    content: {
      type: String,
      default: "",
      maxlength: 10000,
    },
    usageCount: {
      type: Number,
      default: 0,
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

scriptSchema.index({ createdBy: 1, updatedAt: -1 });

const Script = mongoose.models.Script || mongoose.model("Script", scriptSchema);

export default Script;
