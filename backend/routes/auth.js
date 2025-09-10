import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  updatePassword
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validateRequest, authValidationRules, rateLimit } from "../middleware/validation.js";

const router = express.Router();

// Rate limiting for auth routes
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many authentication attempts, please try again later"
});

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: "Too many login attempts, please try again later"
});

// Public routes with validation and rate limiting
router.post("/register", 
  authRateLimit,
  validateRequest(authValidationRules.register),
  register
);

router.post("/login", 
  loginRateLimit,
  validateRequest(authValidationRules.login),
  login
);

// Protected routes
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/updatedetails", 
  protect,
  validateRequest(authValidationRules.updateProfile),
  updateDetails
);
router.put("/updatepassword", 
  protect,
  validateRequest(authValidationRules.updatePassword),
  updatePassword
);

export default router;
