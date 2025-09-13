import { Script } from "../models/index.js";
import { getAssistant as vapiGetAssistant } from "../services/vapiClient.js";

// List scripts for current user
export const listScripts = async (req, res) => {
  try {
    const scripts = await Script.find({ createdBy: req.user.id })
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: scripts });
  } catch (err) {
    console.error("List scripts error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch scripts" });
  }
};

// Get single script
export const getScript = async (req, res) => {
  try {
    const script = await Script.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!script) return res.status(404).json({ success: false, message: "Script not found" });
    res.json({ success: true, data: script });
  } catch (err) {
    console.error("Get script error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch script" });
  }
};

// Create script
export const createScript = async (req, res) => {
  try {
    const { title, systemMessage, content, isDefault } = req.body;
    if (!title || !systemMessage) {
      return res.status(400).json({ success: false, message: "title and systemMessage are required" });
    }

    if (isDefault) {
      await Script.updateMany({ createdBy: req.user.id, isDefault: true }, { $set: { isDefault: false } });
    }

    const script = await Script.create({
      title,
      systemMessage,
      content: content || "",
      isDefault: Boolean(isDefault),
      createdBy: req.user.id,
    });

    // Optionally validate against Vapi assistant exists
    try {
      if (process.env.VAPI_ASSISTANT_ID && process.env.VAPI_API_KEY) {
        await vapiGetAssistant(process.env.VAPI_ASSISTANT_ID);
      }
    } catch (e) {
      console.warn("Vapi assistant not reachable, continuing.");
    }

    res.status(201).json({ success: true, data: script });
  } catch (err) {
    console.error("Create script error:", err);
    res.status(500).json({ success: false, message: "Failed to create script" });
  }
};

// Update script
export const updateScript = async (req, res) => {
  try {
    const { title, systemMessage, content, isDefault } = req.body;
    const script = await Script.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!script) return res.status(404).json({ success: false, message: "Script not found" });

    if (isDefault) {
      await Script.updateMany({ createdBy: req.user.id, isDefault: true, _id: { $ne: script._id } }, { $set: { isDefault: false } });
    }

    if (title !== undefined) script.title = title;
    if (systemMessage !== undefined) script.systemMessage = systemMessage;
    if (content !== undefined) script.content = content;
    if (isDefault !== undefined) script.isDefault = Boolean(isDefault);

    await script.save();
    res.json({ success: true, data: script });
  } catch (err) {
    console.error("Update script error:", err);
    res.status(500).json({ success: false, message: "Failed to update script" });
  }
};

// Delete script
export const deleteScript = async (req, res) => {
  try {
    const script = await Script.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!script) return res.status(404).json({ success: false, message: "Script not found" });
    await Script.deleteOne({ _id: script._id });
    res.json({ success: true, message: "Script deleted" });
  } catch (err) {
    console.error("Delete script error:", err);
    res.status(500).json({ success: false, message: "Failed to delete script" });
  }
};

// Duplicate script
export const duplicateScript = async (req, res) => {
  try {
    const script = await Script.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!script) return res.status(404).json({ success: false, message: "Script not found" });
    const copy = await Script.create({
      title: `${script.title} (Copy)`,
      systemMessage: script.systemMessage,
      content: script.content,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, data: copy });
  } catch (err) {
    console.error("Duplicate script error:", err);
    res.status(500).json({ success: false, message: "Failed to duplicate script" });
  }
};
