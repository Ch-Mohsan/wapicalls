import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    vapiCallId: { 
      type: String, 
      index: true,
      required: true,
      unique: true
    },
    contact: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Contact" 
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true
    },
    status: { 
      type: String, 
      enum: [
        "initiated",
        "queued", 
        "ringing",
        "in-progress",
        "completed",
        "failed",
        "no-answer",
        "busy",
        "canceled",
        "cancelled"
      ],
      default: "initiated",
      index: true
    },
    transcript: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    duration: {
      type: Number, // in seconds
      default: 0
    },
    cost: {
      type: Number, // in cents
      default: 0
    },
    recordingUrl: {
      type: String,
      default: null
    },
    endReason: {
      type: String,
      enum: [
        "user_hangup",
        "assistant_hangup", 
        "timeout",
        "error",
        "max_duration_reached",
        "silence_timeout"
      ],
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    endedAt: {
      type: Date,
      default: null
    },
    vapiResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"]
    },
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: {
      type: Date,
      default: null
    }
  },
  { 
    timestamps: true 
  }
);

// Indexes for better query performance
callSchema.index({ vapiCallId: 1 });
callSchema.index({ status: 1 });
callSchema.index({ createdBy: 1 });
callSchema.index({ contact: 1 });
callSchema.index({ campaign: 1 });
callSchema.index({ createdAt: -1 });
callSchema.index({ startedAt: -1 });

// Compound indexes
callSchema.index({ status: 1, createdAt: -1 });
callSchema.index({ createdBy: 1, status: 1 });

// Virtual for call duration calculation
callSchema.virtual('calculatedDuration').get(function() {
  if (this.startedAt && this.endedAt) {
    return Math.floor((this.endedAt - this.startedAt) / 1000);
  }
  return 0;
});

// Pre-save middleware to calculate duration
callSchema.pre('save', function(next) {
  if (this.startedAt && this.endedAt && !this.duration) {
    this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
  }
  next();
});

const Call = mongoose.models.Call || mongoose.model("Call", callSchema);

export default Call;
