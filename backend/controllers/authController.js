import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { AppError, asyncHandler, sendSuccessResponse, sendErrorResponse } from "../middleware/error.js";

// Generate JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET is not configured', 500);
  }
  
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res, message = "Success") => {
  try {
    const token = generateToken(user._id);

    const cookieOptions = {
      expires: new Date(
        Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    };

    // Remove password from user object before sending
    const userObject = user.toObject();
    delete userObject.password;

    const responseData = {
      token,
      user: {
        id: userObject._id,
        name: userObject.name,
        email: userObject.email,
        role: userObject.role,
        isVerified: userObject.isVerified,
        avatar: userObject.avatar,
        lastLogin: userObject.lastLogin,
        createdAt: userObject.createdAt
      }
    };

    res.status(statusCode)
      .cookie("token", token, cookieOptions)
      .json({
        success: true,
        message,
        data: responseData,
        errors: null
      });
  } catch (error) {
    throw new AppError('Token generation failed', 500);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  // Additional server-side validation
  if (!name?.trim() || !email?.trim() || !password) {
    throw new AppError("Please provide name, email and password", 400, [
      { field: 'name', message: 'Name is required' },
      { field: 'email', message: 'Email is required' },
      { field: 'password', message: 'Password is required' }
    ]);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new AppError("Please provide a valid email address", 400, [
      { field: 'email', message: 'Invalid email format' }
    ]);
  }

  // Password strength validation
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters long", 400, [
      { field: 'password', message: 'Password must be at least 6 characters long' }
    ]);
  }

  // Strong password validation (optional, can be enabled via env var)
  if (process.env.ENFORCE_STRONG_PASSWORDS === 'true') {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!strongPasswordRegex.test(password)) {
      throw new AppError("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character", 400, [
        { field: 'password', message: 'Password is not strong enough' }
      ]);
    }
  }

  // Confirm password validation
  if (password !== confirmPassword) {
    throw new AppError("Passwords do not match", 400, [
      { field: 'confirmPassword', message: 'Passwords do not match' }
    ]);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw new AppError("An account with this email already exists", 400, [
      { field: 'email', message: 'Email is already registered' }
    ]);
  }

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password
  });

  // Update last login
  await user.updateLastLogin();

  // Send success response with token
  sendTokenResponse(user, 201, res, "Account created successfully");
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validation
  if (!email?.trim() || !password) {
    throw new AppError("Please provide email and password", 400, [
      { field: 'email', message: 'Email is required' },
      { field: 'password', message: 'Password is required' }
    ]);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new AppError("Please provide a valid email address", 400, [
      { field: 'email', message: 'Invalid email format' }
    ]);
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401, [
      { field: 'credentials', message: 'Invalid login credentials' }
    ]);
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new AppError("Invalid email or password", 401, [
      { field: 'credentials', message: 'Invalid login credentials' }
    ]);
  }

  // Update last login
  await user.updateLastLogin();

  // Send success response with token
  sendTokenResponse(user, 200, res, "Login successful");
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  sendSuccessResponse(res, 200, "User profile retrieved successfully", {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    }
  });
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  sendSuccessResponse(res, 200, "Logout successful");
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (req, res) => {
  try {
    const { name, email } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name.trim();
    if (email) fieldsToUpdate.email = email.toLowerCase().trim();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User details updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Update details error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", ")
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already in use"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during update"
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current password, new password and confirm password"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check current password
    const isCurrentPasswordMatch = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, "Password updated successfully");

  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password update"
    });
  }
};

export default {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  updatePassword
};
