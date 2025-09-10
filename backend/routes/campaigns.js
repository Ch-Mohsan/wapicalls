import express from "express";
import mongoose from "mongoose";
import { Campaign } from "../models/index.js";

const router = express.Router();

// In-memory fallback (will be used when MongoDB is not available)
let campaignsMemory = [];
let campaignIdCounter = 1;

const generateCampaignId = () => `C${(campaignIdCounter++).toString().padStart(3, '0')}`;

// Get MongoDB availability from environment
const USE_MEMORY_STORE = process.env.FORCE_MEMORY_STORE === "1" || !process.env.MONGODB_URI;

// GET /api/campaigns - Get all campaigns
router.get("/", async (req, res) => {
  try {
    if (USE_MEMORY_STORE) {
      return res.json(campaignsMemory);
    }
    
    const campaigns = await Campaign.find({}).sort({ createdAt: -1 });
    
    // Transform campaigns to match frontend expectations
    const transformedCampaigns = campaigns.map(campaign => ({
      id: campaign._id.toString(),
      name: campaign.name,
      status: campaign.status === 'running' ? 'Running' : 
              campaign.status === 'scheduled' ? 'Scheduled' :
              campaign.status === 'paused' ? 'Paused' :
              campaign.status === 'completed' ? 'Completed' : 'Draft',
      progress: campaign.progress || 0,
      totalCalls: campaign.statistics?.callsCompleted || 0,
      successRate: campaign.successRate || 0,
      script: campaign.script || '',
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt
    }));
    
    res.json(transformedCampaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/campaigns - Create a new campaign
router.post("/", async (req, res) => {
  try {
    const { name, target, startAt, script, status } = req.body;
    
    if (!name || !script) {
      return res.status(400).json({ 
        error: "Missing required fields: name, script" 
      });
    }

    if (USE_MEMORY_STORE) {
      const campaignData = {
        id: generateCampaignId(),
        name,
        target: target || 'Cold Leads',
        startAt: startAt || new Date().toISOString(),
        script,
        status: status || 'Running',
        progress: 0,
        totalCalls: 0,
        successRate: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      campaignsMemory.push(campaignData);
      return res.status(201).json(campaignData);
    }

    // Map frontend status to backend status
    const backendStatus = status === 'Running' ? 'running' :
                         status === 'Scheduled' ? 'scheduled' :
                         status === 'Paused' ? 'paused' :
                         status === 'Completed' ? 'completed' : 'draft';

    const campaignData = {
      name,
      description: `Campaign targeting ${target || 'leads'}`,
      status: backendStatus,
      script,
      assistantId: process.env.VAPI_ASSISTANT_ID || 'default',
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID || 'default',
      scheduledAt: startAt ? new Date(startAt) : null,
      createdBy: new mongoose.Types.ObjectId(), // TODO: Use actual user ID from auth
      statistics: {
        totalContacts: 0,
        callsCompleted: 0,
        callsSuccessful: 0,
        callsFailed: 0
      }
    };

    const campaign = new Campaign(campaignData);
    await campaign.save();
    
    // Transform response to match frontend expectations
    const response = {
      id: campaign._id.toString(),
      name: campaign.name,
      status: status || 'Running',
      progress: 0,
      totalCalls: 0,
      successRate: 0,
      script: campaign.script,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt
    };
    
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/campaigns/:id - Get a specific campaign
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (USE_MEMORY_STORE) {
      const campaign = campaignsMemory.find(c => c.id === id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      return res.json(campaign);
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    // Transform response to match frontend expectations
    const response = {
      id: campaign._id.toString(),
      name: campaign.name,
      status: campaign.status === 'running' ? 'Running' : 
              campaign.status === 'scheduled' ? 'Scheduled' :
              campaign.status === 'paused' ? 'Paused' :
              campaign.status === 'completed' ? 'Completed' : 'Draft',
      progress: campaign.progress || 0,
      totalCalls: campaign.statistics?.callsCompleted || 0,
      successRate: campaign.successRate || 0,
      script: campaign.script,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/campaigns/:id - Update a campaign
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, script } = req.body;
    
    if (USE_MEMORY_STORE) {
      const index = campaignsMemory.findIndex(c => c.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      const updates = { ...req.body, updatedAt: new Date().toISOString() };
      campaignsMemory[index] = { ...campaignsMemory[index], ...updates };
      return res.json(campaignsMemory[index]);
    }

    // Map frontend status to backend status
    const backendStatus = status === 'Running' ? 'running' :
                         status === 'Scheduled' ? 'scheduled' :
                         status === 'Paused' ? 'paused' :
                         status === 'Completed' ? 'completed' : undefined;

    const updates = {};
    if (name) updates.name = name;
    if (script) updates.script = script;
    if (backendStatus) updates.status = backendStatus;

    const campaign = await Campaign.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    );
    
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    // Transform response to match frontend expectations
    const response = {
      id: campaign._id.toString(),
      name: campaign.name,
      status: campaign.status === 'running' ? 'Running' : 
              campaign.status === 'scheduled' ? 'Scheduled' :
              campaign.status === 'paused' ? 'Paused' :
              campaign.status === 'completed' ? 'Completed' : 'Draft',
      progress: campaign.progress || 0,
      totalCalls: campaign.statistics?.callsCompleted || 0,
      successRate: campaign.successRate || 0,
      script: campaign.script,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt
    };
    
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/campaigns/:id - Delete a campaign
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (USE_MEMORY_STORE) {
      const index = campaignsMemory.findIndex(c => c.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      const deleted = campaignsMemory.splice(index, 1)[0];
      return res.json({ message: "Campaign deleted successfully", campaign: deleted });
    }

    const campaign = await Campaign.findByIdAndDelete(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    res.json({ message: "Campaign deleted successfully", campaign: {
      id: campaign._id.toString(),
      name: campaign.name
    }});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
