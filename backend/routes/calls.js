import express from "express";
import {
  getCalls,
  getCall,
  createCall,
  updateCall,
  deleteCall,
  handleVapiWebhook,
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

// CRUD routes
router.route("/")
  .get(getCalls)
  .post(createCall);

router.route("/:id")
  .get(getCall)
  .put(updateCall)
  .delete(deleteCall);

export default router;
