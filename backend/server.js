import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Import middleware
import { errorHandler, notFound } from "./middleware/error.js";

// Import routes
import authRoutes from "./routes/auth.js";
import contactRoutes from "./routes/contacts.js";
import callRoutes from "./routes/calls.js";
import campaignRoutes from "./routes/campaigns.js";
import scriptRoutes from "./routes/scripts.js";

// Import existing VAPI services and utils
import { normalizeVapiEventType, extractCallIdFromEvent, deriveStatusAndTranscript } from "./utils/vapiEvents.js";
import { 
  createOutboundCall, 
  getCall as vapiGetCall, 
  getAssistant as vapiGetAssistant, 
  listPhoneNumbers as vapiListPhoneNumbers, 
  listCalls as vapiListCalls 
} from "./services/vapiClient.js";

// Import models
import { Contact, Call, User } from "./models/index.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Environment variables
const VAPI_KEY = process.env.VAPI_API_KEY;
const ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;
const PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID;
const MONGODB_URI = process.env.MONGODB_URI;
let USE_MEMORY_STORE = process.env.FORCE_MEMORY_STORE === "1" || !MONGODB_URI;
const USE_VAPI = Boolean(VAPI_KEY && ASSISTANT_ID && PHONE_NUMBER_ID);

// MongoDB connection with fallback to in-memory store
if (!USE_MEMORY_STORE) {
  mongoose
    .connect(MONGODB_URI, { dbName: "vapi_demo" })
    .then(() => {
      console.log("✅ Connected to MongoDB");
      USE_MEMORY_STORE = false;
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err?.message || err);
      USE_MEMORY_STORE = true;
      console.log("⚠️ Falling back to in-memory store (non-persistent)");
    });
} else {
  console.log("📝 Using in-memory store (non-persistent)");
}

// In-memory fallback store
const memory = {
  contacts: [],
  calls: []
};

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/scripts", scriptRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    ok: true, 
    db: USE_MEMORY_STORE ? "memory" : "mongo", 
    vapi: USE_VAPI,
    config: {
      hasVapiKey: Boolean(VAPI_KEY),
      hasAssistantId: Boolean(ASSISTANT_ID),
      hasPhoneNumberId: Boolean(PHONE_NUMBER_ID)
    }
  });
});

// Public config for frontend (no secrets)
app.get("/api/config", (req, res) => {
  res.json({
    vapiConfigured: USE_VAPI,
    assistantId: ASSISTANT_ID || null,
    phoneNumberId: PHONE_NUMBER_ID || null,
  });
});

// EXISTING VAPI FUNCTIONALITY (will be moved to controllers later)

// Function to format phone number to E.164 format
function formatPhoneToE164(phoneNumber, defaultCountryCode = '92') {
  if (!phoneNumber) return null;
  
  let cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  if (cleanNumber.startsWith('+')) {
    const digits = cleanNumber.slice(1);
    if (digits.length >= 7 && digits.length <= 15 && /^\d+$/.test(digits)) {
      return cleanNumber;
    }
    return null;
  }
  
  const digitsOnly = cleanNumber.replace(/\+/g, '');
  
  if (digitsOnly.length === 0) return null;
  
  console.log(`Processing digits: "${digitsOnly}"`);
  
  if (digitsOnly.startsWith('92')) {
    if (digitsOnly.length >= 12 && digitsOnly.length <= 13) {
      return `+${digitsOnly}`;
    }
  }
  
  if (digitsOnly.startsWith('03')) {
    if (digitsOnly.length === 11) {
      return `+92${digitsOnly.substring(1)}`;
    }
  }
  
  if (digitsOnly.startsWith('3') && digitsOnly.length === 10) {
    return `+92${digitsOnly}`;
  }
  
  if (digitsOnly.startsWith('0') && digitsOnly.length >= 10) {
    return `+92${digitsOnly.substring(1)}`;
  }
  
  if (digitsOnly.length === 10 && !digitsOnly.startsWith('0') && !digitsOnly.startsWith('3')) {
    return `+1${digitsOnly}`;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+${digitsOnly}`;
  }
  
  if (digitsOnly.length >= 7 && digitsOnly.length <= 12) {
    return `+${defaultCountryCode}${digitsOnly}`;
  }
  
  return null;
}

async function updateCallByVapiId(vapiCallId, update) {
  if (USE_MEMORY_STORE) {
    const idx = memory.calls.findIndex((c) => c.vapiCallId === vapiCallId);
    if (idx > -1) Object.assign(memory.calls[idx], update);
    return memory.calls[idx];
  }
  return Call.findOneAndUpdate({ vapiCallId }, update, { new: true });
}

async function getCallByVapiId(vapiCallId) {
  if (USE_MEMORY_STORE) {
    return memory.calls.find((c) => c.vapiCallId === vapiCallId) || null;
  }
  return Call.findOne({ vapiCallId });
}

// Extract best-effort transcript text from Vapi getCall response
function parseTranscriptFromVapiCall(callData) {
  if (!callData || typeof callData !== "object") return null;

  if (typeof callData.transcript === "string" && callData.transcript.trim()) {
    return callData.transcript.trim();
  }

  // Aggregate messages text if present
  if (Array.isArray(callData.messages)) {
    const parts = [];
    for (const msg of callData.messages) {
      if (!msg) continue;
      if (typeof msg.text === "string" && msg.text.trim()) {
        parts.push(msg.text.trim());
        continue;
      }
      if (Array.isArray(msg.content)) {
        const c = msg.content
          .map((p) => {
            if (typeof p === "string") return p;
            if (p && typeof p === "object") return p.text || p.value || "";
            return "";
          })
          .filter(Boolean)
          .join(" ")
          .trim();
        if (c) parts.push(c);
      }
    }
    if (parts.length > 0) return parts.join("\n");
  }

  // Additional fallbacks
  const moreCandidates = [
    callData.finalTranscript,
    callData.fullTranscript,
    Array.isArray(callData.transcripts) ? callData.transcripts.join("\n") : null,
    callData.summary?.transcript,
    callData.summary?.text,
    callData.analysis?.transcript,
    callData.analysis?.text,
  ];
  const found = moreCandidates.find((s) => typeof s === "string" && s.trim().length > 0);
  if (found) return found.trim();

  return null;
}

function isTerminalCallStatus(status) {
  if (!status || typeof status !== "string") return false;
  const s = status.toLowerCase();
  return [
    "completed",
    "ended",
    "failed",
    "no-answer",
    "busy",
    "canceled",
    "cancelled"
  ].includes(s);
}

// Build assistant overrides from environment
function getAssistantOverridesFromEnv() {
  const overrides = {};

  const firstMessage = process.env.VAPI_FIRST_MESSAGE;
  const systemMessage = process.env.VAPI_SYSTEM_MESSAGE;

  if (firstMessage) overrides.firstMessage = firstMessage;
  if (systemMessage) overrides.systemMessage = systemMessage;

  const voiceProvider = process.env.VAPI_VOICE_PROVIDER;
  const voiceId = process.env.VAPI_VOICE_ID;

  if (voiceProvider && voiceId) {
    overrides.voice = {
      provider: voiceProvider,
      voiceId: voiceId,
    };

    const stability = process.env.VAPI_VOICE_STABILITY;
    const similarityBoost = process.env.VAPI_VOICE_SIMILARITY_BOOST;
    const style = process.env.VAPI_VOICE_STYLE;
    const useSpeakerBoost = process.env.VAPI_VOICE_USE_SPEAKER_BOOST;

    if (stability) overrides.voice.stability = Number(stability);
    if (similarityBoost) overrides.voice.similarityBoost = Number(similarityBoost);
    if (style) overrides.voice.style = Number(style);
    if (useSpeakerBoost) overrides.voice.useSpeakerBoost = useSpeakerBoost === "1" || useSpeakerBoost === "true";
  }

  const silenceTimeout = process.env.VAPI_SILENCE_TIMEOUT_SECONDS;
  const maxDuration = process.env.VAPI_MAX_DURATION_SECONDS;
  const recordingEnabled = process.env.VAPI_RECORDING_ENABLED;
  const endCallFunctionEnabled = process.env.VAPI_END_CALL_FUNCTION_ENABLED;

  if (silenceTimeout) overrides.silenceTimeoutSeconds = Number(silenceTimeout);
  if (maxDuration) overrides.maxDurationSeconds = Number(maxDuration);
  if (recordingEnabled) overrides.recordingEnabled = recordingEnabled === "1" || recordingEnabled === "true";
  if (endCallFunctionEnabled) overrides.endCallFunctionEnabled = endCallFunctionEnabled === "1" || endCallFunctionEnabled === "true";

  return overrides;
}

// Legacy API endpoints (will be moved to controllers gradually)

// Remove legacy endpoints - now handled by controllers

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Enhanced logging for debugging
console.log("=== Vapi Configuration Check ===");
console.log("VAPI_API_KEY:", VAPI_KEY ? `Set (${VAPI_KEY.substring(0, 10)}...)` : "Missing");
console.log("VAPI_ASSISTANT_ID:", ASSISTANT_ID ? `Set (${ASSISTANT_ID})` : "Missing");
console.log("VAPI_PHONE_NUMBER_ID:", PHONE_NUMBER_ID ? `Set (${PHONE_NUMBER_ID})` : "Missing");
console.log("USE_VAPI:", USE_VAPI);
console.log("================================");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server running on http://localhost:" + PORT);
  console.log("\n📋 AVAILABLE ENDPOINTS:");
  console.log("🔐 Authentication:");
  console.log("  - POST /api/auth/register");
  console.log("  - POST /api/auth/login");
  console.log("  - GET /api/auth/me");
  console.log("  - POST /api/auth/logout");
  console.log("\n👥 Contacts:");
  console.log("  - GET /api/contacts");
  console.log("  - POST /api/contacts");
  console.log("  - GET /api/contacts/:id");
  console.log("  - PUT /api/contacts/:id");
  console.log("  - DELETE /api/contacts/:id");
  console.log("\n📞 Calls:");
  console.log("  - GET /api/calls");
  console.log("  - POST /api/calls");
  console.log("  - GET /api/calls/:id");
  console.log("  - PUT /api/calls/:id");
  console.log("  - DELETE /api/calls/:id");
  console.log("\n🎯 Campaigns:");
  console.log("  - GET /api/campaigns");
  console.log("  - POST /api/campaigns");
  console.log("  - GET /api/campaigns/:id");
  console.log("  - PUT /api/campaigns/:id");
  console.log("  - DELETE /api/campaigns/:id");
  console.log("\n📝 Scripts:");
  console.log("  - GET /api/scripts");
  console.log("  - POST /api/scripts");
  console.log("  - GET /api/scripts/:id");
  console.log("  - PUT /api/scripts/:id");
  console.log("  - DELETE /api/scripts/:id");
  console.log("  - POST /api/scripts/:id/duplicate");
  console.log("\n🔧 Legacy/Debug:");
  console.log("  - POST /api/vapi/webhook");
  console.log("  - GET /api/calls");
  console.log("  - POST /api/test-phone");
  console.log("  - GET /api/health");
});

export default app;
