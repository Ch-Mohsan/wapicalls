import express from "express";
import {
  getCalls,
  getCall,
  createCall,
  updateCall,
  deleteCall,
  deleteBulkCalls,
  handleVapiWebhook,
  refreshCallFromVapi,
  testPhoneFormat
} from "../controllers/callController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public webhook route (no auth required)
router.post("/webhook", handleVapiWebhook);

// Protected routes (require authentication)
router.use(protect);

// Test phone format route
router.post("/test-phone", testPhoneFormat);

// Bulk delete route
router.delete("/bulk", deleteBulkCalls);

// CRUD routes
router.route("/")
  .get(getCalls)
  .post(createCall);

router.route("/:id")
  .get(getCall)
  .put(updateCall)
  .delete(deleteCall);

// Refresh call data from VAPI
router.post("/:id/refresh", refreshCallFromVapi);

export default router;
