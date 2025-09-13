import express from "express";
import { protect } from "../middleware/auth.js";
import {
  listScripts,
  getScript,
  createScript,
  updateScript,
  deleteScript,
  duplicateScript,
} from "../controllers/scriptController.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(listScripts)
  .post(createScript);

router.post("/:id/duplicate", duplicateScript);

router.route("/:id")
  .get(getScript)
  .put(updateScript)
  .delete(deleteScript);

export default router;
