import { Campaign, Contact, Call, Script } from "../models/index.js";
import mongoose from "mongoose";
import { createOutboundCall, getCall as vapiGetCall } from "../services/vapiClient.js";

const USE_MEMORY_STORE = process.env.FORCE_MEMORY_STORE === "1" || !process.env.MONGODB_URI;

function sanitizeAssistantOverrides(input) {
  if (!input || typeof input !== 'object') return {};
  const copy = { ...input };
  delete copy.systemMessage;
  delete copy.instructions;
  return copy;
}

function getAssistantOverridesFromEnv() {
  const overrides = {};
  const firstMessage = process.env.VAPI_FIRST_MESSAGE;
  if (firstMessage) overrides.firstMessage = firstMessage;

  const voiceProvider = process.env.VAPI_VOICE_PROVIDER;
  const voiceId = process.env.VAPI_VOICE_ID;
  if (voiceProvider && voiceId) {
    overrides.voice = { provider: voiceProvider, voiceId };
  }
  return overrides;
}

function formatPhoneToE164(phoneNumber, defaultCountryCode = '92') {
  if (!phoneNumber) return null;
  let cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  if (cleanNumber.startsWith('+')) {
    const digits = cleanNumber.slice(1);
    if (digits.length >= 7 && digits.length <= 15 && /^\d+$/.test(digits)) return cleanNumber;
    return null;
  }
  const digitsOnly = cleanNumber.replace(/\+/g, '');
  if (digitsOnly.length === 0) return null;
  if (digitsOnly.startsWith('92')) {
    if (digitsOnly.length >= 12 && digitsOnly.length <= 13) return `+${digitsOnly}`;
  }
  if (digitsOnly.startsWith('03')) {
    if (digitsOnly.length === 11) return `+92${digitsOnly.substring(1)}`;
  }
  if (digitsOnly.startsWith('3') && digitsOnly.length === 10) return `+92${digitsOnly}`;
  if (digitsOnly.startsWith('0') && digitsOnly.length >= 10) return `+92${digitsOnly.substring(1)}`;
  if (digitsOnly.length === 10 && !digitsOnly.startsWith('0') && !digitsOnly.startsWith('3')) return `+1${digitsOnly}`;
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) return `+${digitsOnly}`;
  if (digitsOnly.length >= 7 && digitsOnly.length <= 12) return `+${defaultCountryCode}${digitsOnly}`;
  return null;
}

// POST /api/campaigns/:id/start - create calls for campaign contacts and kick off Vapi calls
export const startCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { contactIds = [], assistantOverrides, scriptId, retryAll = false } = req.body || {};

    let campaign = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      try {
        campaign = await Campaign.findById(id);
      } catch {}
    }

    // Get contacts: explicit selection or by campaign.contacts (with fallback if none found)
    let contacts = [];
    if (Array.isArray(contactIds) && contactIds.length > 0) {
      contacts = await Contact.find({ _id: { $in: contactIds }, createdBy: req.user.id });
    } else if (campaign && Array.isArray(campaign.contacts) && campaign.contacts.length > 0) {
      contacts = await Contact.find({ _id: { $in: campaign.contacts }, createdBy: req.user.id });
      if (!contacts.length) {
        console.warn('[VAPI] Campaign contacts referenced but none fetched (maybe ownership mismatch) – falling back to active contacts');
        contacts = await Contact.find({ createdBy: req.user.id, status: 'active' }).limit(50);
      }
    } else {
      // Fallback: use all active contacts of user
      contacts = await Contact.find({ createdBy: req.user.id, status: 'active' }).limit(50);
    }

    if (!contacts.length) return res.status(400).json({ success: false, message: 'No contacts to call' });

    const VAPI_KEY = process.env.VAPI_API_KEY;
    const ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;
    const PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID;
    const USE_VAPI = Boolean(VAPI_KEY && ASSISTANT_ID && PHONE_NUMBER_ID);

    // Prepare script firstMessage prefix if provided
    let scriptSystemMessage = null;
    if (scriptId) {
      try {
        const s = await Script.findById(scriptId).lean();
        if (s?.systemMessage) scriptSystemMessage = s.systemMessage;
        else if (s?.content) scriptSystemMessage = s.content; // fallback to content
        if (!s) console.warn('[VAPI] Script not found for id', scriptId);
        else if (!scriptSystemMessage) console.warn('[VAPI] Script has no systemMessage/content for id', scriptId);
      } catch (e) {
        console.warn('[VAPI] Failed to load script for campaign start:', e.message);
      }
    } else if (campaign && typeof campaign.script === 'string' && campaign.script.trim()) {
      // Fallback: use campaign.script text if present (legacy campaigns)
      scriptSystemMessage = campaign.script.trim();
    }

    const envOverrides = getAssistantOverridesFromEnv();
    const mergedBase = { ...envOverrides, ...assistantOverrides };
    const defaultGreeting = process.env.VAPI_FIRST_MESSAGE || "Hello! This is your AI assistant calling.";
    if (!mergedBase.firstMessage) mergedBase.firstMessage = defaultGreeting;

    // Build set of contacts already called in this campaign (to avoid duplicates unless retryAll)
    let alreadyCalled = new Set();
    if (campaign && !retryAll) {
      try {
        const existingCalls = await Call.find({ campaign: campaign._id }, 'contact');
        for (const ec of existingCalls) if (ec.contact) alreadyCalled.add(ec.contact.toString());
      } catch (e) { console.warn('[VAPI] Failed to load existing calls for duplicate prevention:', e.message); }
    }

    const results = [];
    for (const c of contacts) {
      if (campaign && !retryAll && alreadyCalled.has(c._id.toString())) {
        results.push({ contactId: c._id, status: 'skipped', reason: 'already_called' });
        continue;
      }
      const formatted = formatPhoneToE164(c.phoneNumber);
      if (!formatted) {
        results.push({ contactId: c._id, status: 'skipped', reason: 'invalid_number' });
        continue;
      }

      let vapiResponse = { id: `mock_${Date.now()}_${Math.random().toString(36).slice(2)}` };
      if (USE_VAPI) {
        try {
          let payload;
          if (scriptSystemMessage) {
            const provider = process.env.VAPI_MODEL_PROVIDER || 'openai';
            const model = process.env.VAPI_MODEL_NAME || 'gpt-4o-mini';
            const temperature = process.env.VAPI_MODEL_TEMPERATURE ? Number(process.env.VAPI_MODEL_TEMPERATURE) : 0.7;
            payload = {
              type: 'outboundPhoneCall',
              assistant: {
                name: 'Dynamic Campaign Assistant',
                model: {
                  provider,
                  model,
                  messages: [ { role: 'system', content: scriptSystemMessage } ],
                  temperature,
                },
                voice: mergedBase.voice,
                firstMessage: mergedBase.firstMessage,
              },
              phoneNumberId: PHONE_NUMBER_ID,
              customer: { number: formatted, name: c.name }
            };
            console.log('[VAPI] Campaign transient assistant applied script length:', scriptSystemMessage.length, 'for contact', c._id?.toString?.());
          } else {
            const safeOverrides = sanitizeAssistantOverrides(mergedBase);
            payload = {
              type: 'outboundPhoneCall',
              assistantId: ASSISTANT_ID,
              phoneNumberId: PHONE_NUMBER_ID,
              customer: { number: formatted, name: c.name }
            };
            if (Object.keys(safeOverrides).length > 0) payload.assistantOverrides = safeOverrides;
            console.log('[VAPI] Campaign using stored assistantId with overrides keys:', Object.keys(safeOverrides));
          }
          vapiResponse = await createOutboundCall(payload);
        } catch (err) {
          results.push({ contactId: c._id, status: 'failed', reason: err.message });
          continue;
        }
      }

      // Save Call record
      const callDoc = {
        vapiCallId: vapiResponse.id,
        contact: c._id,
        name: c.name,
        phoneNumber: c.phoneNumber,
        status: 'initiated',
        script: scriptId || null,
        createdBy: req.user.id
      };
      if (campaign) callDoc.campaign = campaign._id;
      const call = await Call.create(callDoc);

      results.push({ contactId: c._id, status: 'queued', callId: call._id, vapiCallId: vapiResponse.id });
    }

    // Update campaign status and stats
    if (campaign) {
      await Campaign.findByIdAndUpdate(campaign._id, { status: 'running', startedAt: new Date(), 'statistics.totalContacts': contacts.length });
    }

    const queued = results.filter(r => r.status === 'queued').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const failed = results.filter(r => r.status === 'failed').length;
    console.log(`[VAPI] startCampaign complete id=${id} retryAll=${retryAll} queued=${queued} skipped=${skipped} failed=${failed}`);
    const msg = queued > 0 ? 'Campaign started' : (skipped > 0 ? 'No new contacts to call' : 'No contacts queued');
    res.status(200).json({ success: true, message: msg, data: { results, count: results.length, queued, skipped, failed, retryAll } });
  } catch (err) {
    console.error('startCampaign error:', err);
    res.status(500).json({ success: false, message: 'Error starting campaign', error: err?.message });
  }
};

// GET /api/campaigns/:id/results - summarize calls of campaign
export const getCampaignResults = async (req, res) => {
  try {
    const { id } = req.params;
    const calls = await Call.find({ campaign: id, createdBy: req.user.id }).sort({ createdAt: -1 }).limit(500);
    const total = calls.length;
    const buckets = {
      initiated: 0,
      ringing: 0,
      inProgress: 0,
      ended: 0,
    };
    const endedStatuses = new Set(['completed', 'failed', 'no-answer', 'busy', 'canceled', 'cancelled']);
    for (const c of calls) {
      if (c.status === 'ringing') buckets.ringing++;
      else if (c.status === 'in-progress') buckets.inProgress++;
      else if (c.status === 'initiated' || c.status === 'queued') buckets.initiated++;
      else if (endedStatuses.has(c.status)) buckets.ended++;
    }
    const completed = calls.filter(c => c.status === 'completed').length;
    const successRate = total ? Math.round((completed / total) * 100) : 0;
    const simplifiedCalls = calls.map(c => ({
      id: c._id?.toString?.() || c.id,
      contactName: c.name,
      phoneNumber: c.phoneNumber,
      status: c.status,
      duration: c.duration || c.calculatedDuration || 0,
      startedAt: c.startedAt,
      endedAt: c.endedAt,
      vapiCallId: c.vapiCallId,
    }));
    res.json({ success: true, data: { total, completed, successRate, buckets, calls: simplifiedCalls } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load results' });
  }
};

// POST /api/campaigns/create-and-start - create a campaign and immediately start it with provided contacts
export const createAndStartCampaign = async (req, res) => {
  try {
    const { name, contactIds = [], scriptId, assistantOverrides } = req.body || {};
    // Create campaign if Mongo is available and ID can be generated
    let campaign = null;
    try {
      campaign = await Campaign.create({
        name: name || `Campaign ${new Date().toLocaleString()}`,
        status: 'running',
        script: '',
        assistantId: process.env.VAPI_ASSISTANT_ID || 'default',
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID || 'default',
        contacts: Array.isArray(contactIds) ? contactIds : [],
        createdBy: req.user.id,
        statistics: { totalContacts: Array.isArray(contactIds) ? contactIds.length : 0 },
      });
    } catch {}

    // Reuse startCampaign logic by faking params
    req.params.id = campaign?._id?.toString?.() || 'new';
    req.body = { contactIds, scriptId, assistantOverrides };
    return startCampaign(req, res);
  } catch (err) {
    console.error('createAndStartCampaign error:', err);
    res.status(500).json({ success: false, message: 'Error creating and starting campaign', error: err?.message });
  }
};

export default { startCampaign, getCampaignResults, createAndStartCampaign };