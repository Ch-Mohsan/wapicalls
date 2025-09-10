import express from "express";
import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  bulkImportContacts
} from "../controllers/contactController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.route("/")
  .get(getContacts)
  .post(createContact);

router.post("/bulk-import", bulkImportContacts);

router.route("/:id")
  .get(getContact)
  .put(updateContact)
  .delete(deleteContact);

export default router;
