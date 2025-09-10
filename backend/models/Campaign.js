import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
      minlength: [2, "Campaign name must be at least 2 characters long"],
      maxlength: [100, "Campaign name cannot exceed 100 characters"]
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"]
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "running", "paused", "completed", "cancelled"],
      default: "draft",
      index: true
    },
    type: {
      type: String,
      enum: ["outbound", "inbound", "mixed"],
      default: "outbound"
    },
    script: {
      type: String,
      maxlength: [2000, "Script cannot exceed 2000 characters"]
    },
    assistantId: {
      type: String,
      required: true
    },
    phoneNumberId: {
      type: String,
      required: true
    },
    contacts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact"
    }],
    calls: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Call"
    }],
    scheduledAt: {
      type: Date,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    settings: {
      maxConcurrentCalls: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
      },
      callInterval: {
        type: Number, // seconds between calls
        default: 30,
        min: 5
      },
      maxRetries: {
        type: Number,
        default: 2,
        min: 0,
        max: 5
      },
      voiceSettings: {
        stability: {
          type: Number,
          min: 0,
          max: 1,
          default: 0.8
        },
        similarityBoost: {
          type: Number,
          min: 0,
          max: 1,
          default: 0.8
        },
        style: {
          type: Number,
          min: 0,
          max: 1,
          default: 0.5
        }
      }
    },
    statistics: {
      totalContacts: {
        type: Number,
        default: 0
      },
      callsCompleted: {
        type: Number,
        default: 0
      },
      callsSuccessful: {
        type: Number,
        default: 0
      },
      callsFailed: {
        type: Number,
        default: 0
      },
      totalDuration: {
        type: Number, // in seconds
        default: 0
      },
      totalCost: {
        type: Number, // in cents
        default: 0
      }
    },
    tags: [{
      type: String,
      trim: true
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    team: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      role: {
        type: String,
        enum: ["owner", "editor", "viewer"],
        default: "viewer"
      }
    }]
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
campaignSchema.index({ status: 1 });
campaignSchema.index({ createdBy: 1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ scheduledAt: 1 });
campaignSchema.index({ name: "text", description: "text" });

// Compound indexes
campaignSchema.index({ status: 1, createdAt: -1 });
campaignSchema.index({ createdBy: 1, status: 1 });

// Virtual for success rate
campaignSchema.virtual('successRate').get(function() {
  if (this.statistics.callsCompleted === 0) return 0;
  return Math.round((this.statistics.callsSuccessful / this.statistics.callsCompleted) * 100);
});

// Virtual for progress percentage
campaignSchema.virtual('progress').get(function() {
  if (this.statistics.totalContacts === 0) return 0;
  return Math.round((this.statistics.callsCompleted / this.statistics.totalContacts) * 100);
});

const Campaign = mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);

export default Campaign;
