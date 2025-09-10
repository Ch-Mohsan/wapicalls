// Enhanced error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging (but don't expose sensitive info in production)
  if (process.env.NODE_ENV !== 'production') {
    console.error("Error Stack:", err.stack);
  } else {
    console.error("Error:", err.message);
  }

  // Default error response structure
  let response = {
    success: false,
    message: 'Server Error',
    errors: null,
    data: null
  };

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    response.message = "Resource not found";
    return res.status(404).json(response);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    response.message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    response.errors = [{
      field: field,
      message: `${field} must be unique`
    }];
    return res.status(400).json(response);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    response.message = "Validation failed";
    response.errors = errors;
    return res.status(400).json(response);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    response.message = "Invalid authentication token";
    return res.status(401).json(response);
  }

  if (err.name === "TokenExpiredError") {
    response.message = "Authentication token has expired";
    return res.status(401).json(response);
  }

  // Multer errors (file upload)
  if (err.code === "LIMIT_FILE_SIZE") {
    response.message = "File size too large";
    return res.status(400).json(response);
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    response.message = "Unexpected file field";
    return res.status(400).json(response);
  }

  // Network/timeout errors
  if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
    response.message = "External service unavailable";
    return res.status(503).json(response);
  }

  // Custom application errors
  if (err.isOperational) {
    response.message = err.message;
    response.errors = err.errors || null;
    return res.status(err.statusCode || 500).json(response);
  }

  // Default server error
  response.message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong' 
    : err.message;

  res.status(error.statusCode || 500).json(response);
};

// Not found middleware
export const notFound = (req, res, next) => {
  const response = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errors: null,
    data: null
  };
  
  res.status(404).json(response);
};

// Custom error class for application-specific errors
export class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Success response helper
export const sendSuccessResponse = (res, statusCode = 200, message = 'Success', data = null, pagination = null) => {
  const response = {
    success: true,
    message,
    data,
    errors: null
  };

  if (pagination) {
    response.pagination = pagination;
  }

  res.status(statusCode).json(response);
};

// Error response helper
export const sendErrorResponse = (res, statusCode = 500, message = 'Server Error', errors = null) => {
  const response = {
    success: false,
    message,
    errors,
    data: null
  };

  res.status(statusCode).json(response);
};

export default {
  errorHandler,
  notFound,
  AppError,
  asyncHandler,
  sendSuccessResponse,
  sendErrorResponse
};
