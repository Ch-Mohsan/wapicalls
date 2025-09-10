import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Contact name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    phoneNumber: { 
      type: String, 
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number"]
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email"
      ]
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"]
    },
    tags: [{
      type: String,
      trim: true
    }],
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"]
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active"
    },
    source: {
      type: String,
      enum: ["manual", "import", "api", "web_form"],
      default: "manual"
    },
    customFields: {
      type: Map,
      of: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    lastContactedAt: {
      type: Date,
      default: null
    }
  },
  { 
    timestamps: true 
  }
);

// Indexes for better query performance
contactSchema.index({ phoneNumber: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ createdBy: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

// Compound index for searching
contactSchema.index({ 
  name: "text", 
  email: "text", 
  company: "text",
  notes: "text"
});

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);

export default Contact;
