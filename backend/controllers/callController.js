import { Call } from "../models/index.js";
import { Contact } from "../models/index.js";
import { Script } from "../models/index.js";
import { 
  createOutboundCall, 
  getCall as vapiGetCall 
} from "../services/vapiClient.js";
import { 
  normalizeVapiEventType, 
  extractCallIdFromEvent, 
  deriveStatusAndTranscript 
} from '../utils/vapiEvents.js';

// Environment variables
const USE_MEMORY_STORE = process.env.FORCE_MEMORY_STORE === "1" || !process.env.MONGODB_URI;

// Memory store fallback
const memory = { calls: [] };

// Helper functions for webhook processing
async function getCallByVapiId(vapiId) {
  if (USE_MEMORY_STORE) {
    return memory.calls.find(c => c.vapiId === vapiId);
  }
  return await Call.findOne({ vapiId });
}

async function updateCallByVapiId(vapiId, update) {
  if (USE_MEMORY_STORE) {
    const callIndex = memory.calls.findIndex(c => c.vapiId === vapiId);
    if (callIndex !== -1) {
      memory.calls[callIndex] = { ...memory.calls[callIndex], ...update };
    }
    return;
  }
  await Call.findOneAndUpdate({ vapiId }, update);
}

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

// Build assistant overrides from environment (only keys Vapi accepts)
function getAssistantOverridesFromEnv() {
  const overrides = {};

  const firstMessage = process.env.VAPI_FIRST_MESSAGE;
  // NOTE: Vapi API rejects 'systemMessage' and 'instructions' on assistantOverrides

  if (firstMessage) overrides.firstMessage = firstMessage;

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

  return overrides;
}

// Remove keys not accepted by Vapi assistantOverrides
function sanitizeAssistantOverrides(input) {
  if (!input || typeof input !== 'object') return {};
  const copy = { ...input };
  delete copy.systemMessage;
  delete copy.instructions;
  return copy;
}

// @desc    Get all calls for authenticated user
// @route   GET /api/calls
// @access  Private
export const getCalls = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Build query
    const query = { createdBy: req.user.id };

    // Add filters
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [calls, total] = await Promise.all([
      Call.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate("contact", "name email company phoneNumber")
        .populate("createdBy", "name email"),
      Call.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: calls,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error("Get calls error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching calls"
    });
  }
};

// @desc    Get single call
// @route   GET /api/calls/:id
// @access  Private
export const getCall = async (req, res) => {
  try {
    const call = await Call.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    })
      .populate("contact", "name email company phoneNumber")
      .populate("createdBy", "name email");

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found"
      });
    }

    res.status(200).json({
      success: true,
      data: call
    });
  } catch (error) {
    console.error("Get call error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching call"
    });
  }
};

// @desc    Create outbound call
// @route   POST /api/calls
// @access  Private
export const createCall = async (req, res) => {
  try {
    const { contactId, phoneNumber, name, assistantOverrides, scriptId } = req.body;

    let resolvedName = name;
    let resolvedNumber = phoneNumber;
    let resolvedContactId = contactId;

    // If contactId is provided, get contact details
    if (contactId) {
      const contact = await Contact.findOne({
        _id: contactId,
        createdBy: req.user.id
      });

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: "Contact not found"
        });
      }

      resolvedName = contact.name;
      resolvedNumber = contact.phoneNumber;
    }

  // Validation
    if (!resolvedNumber || !resolvedName) {
      return res.status(400).json({
        success: false,
        message: "Please provide contactId or both name and phoneNumber"
      });
    }

    // Format phone number
    const formattedNumber = formatPhoneToE164(resolvedNumber);
    if (!formattedNumber) {
      return res.status(400).json({
        success: false,
        message: `Invalid phone number format: "${resolvedNumber}". Please use E.164 format like +1234567890`
      });
    }

    console.log(`Formatting phone number: "${resolvedNumber}" -> "${formattedNumber}"`);

    // Check if VAPI is configured
    const VAPI_KEY = process.env.VAPI_API_KEY;
    const ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;
    const PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID;
    const USE_VAPI = Boolean(VAPI_KEY && ASSISTANT_ID && PHONE_NUMBER_ID);

    let vapiCallData;

    if (USE_VAPI) {
      try {
        // Merge environment overrides with request overrides
  const envOverrides = getAssistantOverridesFromEnv();
  const mergedOverrides = { ...envOverrides, ...assistantOverrides };

        // If a script is provided, try to fetch its systemMessage
        let scriptSystemMessage = null;
        if (scriptId) {
          try {
            const s = await Script.findById(scriptId).lean();
            if (s?.systemMessage) scriptSystemMessage = s.systemMessage.trim();
          } catch (e) {
            console.warn('Failed to fetch script systemMessage:', e.message);
          }
        }

        const defaultGreeting = process.env.VAPI_FIRST_MESSAGE || "Hello! This is your AI assistant calling.";
        if (!mergedOverrides.firstMessage) mergedOverrides.firstMessage = defaultGreeting;

        let payload;
        if (scriptSystemMessage) {
          // Use transient assistant configuration so script becomes a system message (not spoken)
            const provider = process.env.VAPI_MODEL_PROVIDER || 'openai';
            const model = process.env.VAPI_MODEL_NAME || 'gpt-4o-mini';
            const temperature = process.env.VAPI_MODEL_TEMPERATURE ? Number(process.env.VAPI_MODEL_TEMPERATURE) : 0.7;
            // Provide a short greeting separate from instructions
            const greeting = mergedOverrides.firstMessage;
            // Add a compact summary at top of greeting so if model truncates system context, we still hint behavior
            const trimmedSummary = scriptSystemMessage.slice(0, 220).replace(/\s+/g, ' ');
            const augmentedGreeting = `Hi, this is your AI representative. ${greeting || ''}`.trim();
            const transientAssistant = {
              name: 'Dynamic Call Assistant',
              model: {
                provider,
                model,
                messages: [
                  { role: 'system', content: scriptSystemMessage }
                ],
                temperature,
              },
              voice: mergedOverrides.voice, // if any from env
              firstMessage: augmentedGreeting,
            };
            payload = {
              type: 'outboundPhoneCall',
              assistant: transientAssistant,
              phoneNumberId: PHONE_NUMBER_ID,
              customer: { number: formattedNumber, name: resolvedName }
            };
            console.log('[VAPI] Using transient assistant with system script length:', scriptSystemMessage.length);
        } else {
          // Fall back to stored assistant + assistantOverrides (without unsupported keys)
          const safeOverrides = sanitizeAssistantOverrides(mergedOverrides);
          payload = {
            type: 'outboundPhoneCall',
            assistantId: ASSISTANT_ID,
            phoneNumberId: PHONE_NUMBER_ID,
            customer: { number: formattedNumber, name: resolvedName }
          };
          if (Object.keys(safeOverrides).length > 0) payload.assistantOverrides = safeOverrides;
          console.log('[VAPI] Using stored assistantId with overrides keys:', Object.keys(safeOverrides));
        }

        console.log("=== VAPI CALL PAYLOAD ===");
        console.log(JSON.stringify(payload, null, 2));
        console.log("========================");

        vapiCallData = await createOutboundCall(payload);
        console.log("✅ Vapi call initiated successfully:", vapiCallData);

      } catch (err) {
        console.error("❌ Vapi call failed:");
        console.error("Status:", err.response?.status);
        console.error("Data:", JSON.stringify(err.response?.data, null, 2));
        console.error("Message:", err.message);

        return res.status(500).json({
          success: false,
          message: "Vapi call failed",
          details: {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message
          }
        });
      }
    } else {
      console.log("Using mock call - Missing Vapi credentials");
      vapiCallData = { id: `mock_${Date.now()}` };
    }

    // Create call record in database
    const call = await Call.create({
      vapiCallId: vapiCallData.id,
      contact: resolvedContactId || undefined,
      phoneNumber: resolvedNumber,
      name: resolvedName,
      status: "initiated",
      transcript: null,
      script: scriptId || null,
      createdBy: req.user.id
    });

    // Increment script usage if provided
    if (scriptId) {
      try { await Script.findByIdAndUpdate(scriptId, { $inc: { usageCount: 1 } }); } catch {}
    }

    const populatedCall = await Call.findById(call._id)
      .populate("contact", "name email company phoneNumber")
      .populate("createdBy", "name email");

    // Start status monitoring for real VAPI calls
    if (USE_VAPI) {
      // Check status after 5 seconds
      setTimeout(async () => {
        try {
          const statusData = await vapiGetCall(vapiCallData.id);
          console.log(`📞 Call ${vapiCallData.id} status after 5s:`, statusData.status);
          
          if (statusData?.status) {
            await Call.findOneAndUpdate(
              { vapiCallId: vapiCallData.id },
              { status: statusData.status }
            );
          }
        } catch (err) {
          console.error("Failed to check call status:", err.message);
        }
      }, 5000);
    }

    res.status(201).json({
      success: true,
      message: "Call initiated successfully",
      data: {
        call: populatedCall,
        vapiResponse: vapiCallData
      }
    });

  } catch (error) {
    console.error("Create call error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating call"
    });
  }
};

// @desc    Update call
// @route   PUT /api/calls/:id
// @access  Private
export const updateCall = async (req, res) => {
  try {
    const { notes, tags, followUpRequired, followUpDate } = req.body;

    const call = await Call.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found"
      });
    }

    // Build update object
    const updateFields = {};
    if (notes !== undefined) updateFields.notes = notes;
    if (tags !== undefined) updateFields.tags = tags;
    if (followUpRequired !== undefined) updateFields.followUpRequired = followUpRequired;
    if (followUpDate !== undefined) updateFields.followUpDate = followUpDate;

    const updatedCall = await Call.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    )
      .populate("contact", "name email company phoneNumber")
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Call updated successfully",
      data: updatedCall
    });
  } catch (error) {
    console.error("Update call error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating call"
    });
  }
};

// @desc    Delete call
// @route   DELETE /api/calls/:id
// @access  Private
export const deleteCall = async (req, res) => {
  try {
    const call = await Call.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found"
      });
    }

    await Call.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Call deleted successfully"
    });
  } catch (error) {
    console.error("Delete call error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting call"
    });
  }
};

// @desc    Handle VAPI webhook
// @route   POST /api/calls/webhook
// @access  Public (webhook from VAPI)
export const handleVapiWebhook = async (req, res) => {
  try {
    const event = req.body || {};

    const normalizedType = normalizeVapiEventType(event.type);
    const vapiId = extractCallIdFromEvent(event);

    console.log("🔔 === VAPI WEBHOOK RECEIVED ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Event Type:", event.type, "=>", normalizedType);
    console.log("Call ID:", vapiId);
    console.log("Full Event:", JSON.stringify(event, null, 2));
    console.log("===============================");

    if (!vapiId) {
      console.log("⚠️ No call ID found in webhook event");
      return res.sendStatus(200);
    }

    const { statusUpdate, transcriptUpdate } = deriveStatusAndTranscript(event);

    const update = {};
    if (statusUpdate) update.status = statusUpdate;
    if (event.status && !update.status) update.status = event.status;

    if (transcriptUpdate) {
      const existing = await getCallByVapiId(vapiId);
      const previousText = typeof existing?.transcript === "string" ? existing.transcript : "";
      update.transcript = previousText
        ? `${previousText}\n${transcriptUpdate}`
        : transcriptUpdate;
    }

    if (Object.keys(update).length > 0) {
      await updateCallByVapiId(vapiId, update);
      console.log("💾 Updated call in database:", update);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.sendStatus(200);
  }
};

// @desc    Refresh call data from VAPI
// @route   POST /api/calls/:id/refresh
// @access  Private
export const refreshCallFromVapi = async (req, res) => {
  try {
    const call = await Call.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found"
      });
    }

    if (!call.vapiCallId) {
      return res.status(400).json({
        success: false,
        message: "Call does not have a VAPI call ID"
      });
    }

    try {
      // Get latest data from VAPI
      const vapiData = await vapiGetCall(call.vapiCallId);
      console.log("🔄 VAPI call data:", JSON.stringify(vapiData, null, 2));

      // Extract meaningful data
      const updates = {};
      
      if (vapiData.status) {
        updates.status = vapiData.status;
      }
      
      if (vapiData.duration || vapiData.durationSeconds) {
        updates.duration = vapiData.duration || vapiData.durationSeconds;
      }
      
      if (vapiData.cost || vapiData.costBreakdown?.total) {
        updates.cost = vapiData.cost || vapiData.costBreakdown?.total || 0;
      }
      
      if (vapiData.endReason) {
        updates.endReason = vapiData.endReason;
      }
      
      if (vapiData.startedAt) {
        updates.startedAt = new Date(vapiData.startedAt);
      }
      
      if (vapiData.endedAt) {
        updates.endedAt = new Date(vapiData.endedAt);
      }
      
      if (vapiData.recordingUrl) {
        updates.recordingUrl = vapiData.recordingUrl;
      }

      // Handle transcript
      if (vapiData.transcript) {
        updates.transcript = vapiData.transcript;
      } else if (vapiData.messages && Array.isArray(vapiData.messages)) {
        // Build transcript from messages
        const transcript = vapiData.messages
          .map(msg => {
            const role = msg.role || 'unknown';
            const content = msg.content || msg.text || '';
            return `${role}: ${content}`;
          })
          .join('\n');
        if (transcript) {
          updates.transcript = transcript;
        }
      }
      
      // Store the full VAPI response for debugging
      updates.vapiResponse = vapiData;

      console.log("📝 Updating call with:", updates);

      // Update the call
      const updatedCall = await Call.findByIdAndUpdate(
        call._id,
        updates,
        { new: true }
      ).populate("contact", "name email company phoneNumber")
       .populate("createdBy", "name email");

      res.status(200).json({
        success: true,
        message: "Call refreshed from VAPI successfully",
        data: updatedCall,
        vapiData: vapiData
      });

    } catch (vapiError) {
      console.error("Error fetching from VAPI:", vapiError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch call data from VAPI",
        error: vapiError.message
      });
    }

  } catch (error) {
    console.error("Refresh call error:", error);
    res.status(500).json({
      success: false,
      message: "Error refreshing call"
    });
  }
};

// @desc    Test phone number formatting
// @route   POST /api/calls/test-phone
// @access  Private
export const testPhoneFormat = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const formatted = formatPhoneToE164(phoneNumber);
    
    res.json({
      original: phoneNumber,
      formatted: formatted,
      isValid: formatted !== null,
      examples: {
        pakistani: "03001234567 -> +923001234567",
        us: "1234567890 -> +11234567890"
      }
    });
  } catch (error) {
    console.error("Test phone format error:", error);
    res.status(500).json({
      success: false,
      message: "Error testing phone format"
    });
  }
};

// @desc    Delete multiple calls
// @route   DELETE /api/calls/bulk
// @access  Private
export const deleteBulkCalls = async (req, res) => {
  try {
    const { callIds } = req.body;

    // Validation
    if (!callIds || !Array.isArray(callIds) || callIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of call IDs"
      });
    }

    // Verify all calls belong to the authenticated user
    const userCalls = await Call.find({
      _id: { $in: callIds },
      createdBy: req.user.id
    });

    if (userCalls.length !== callIds.length) {
      return res.status(403).json({
        success: false,
        message: "Some calls not found or you don't have permission to delete them"
      });
    }

    // Delete the calls
    const deleteResult = await Call.deleteMany({
      _id: { $in: callIds },
      createdBy: req.user.id
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} call(s)`,
      deletedCount: deleteResult.deletedCount
    });

  } catch (error) {
    console.error("Bulk delete calls error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting calls"
    });
  }
};
