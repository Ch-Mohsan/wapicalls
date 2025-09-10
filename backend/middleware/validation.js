// Enhanced validation middleware
export const validateRequest = (validationRules) => {
  return (req, res, next) => {
    const errors = [];

    for (const rule of validationRules) {
      const { field, type, required, minLength, maxLength, pattern, custom } = rule;
      const value = req.body[field];

      // Check if field is required
      if (required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors.push({
          field,
          message: `${field} is required`
        });
        continue;
      }

      // Skip further validation if field is not required and empty
      if (!required && (!value || (typeof value === 'string' && !value.trim()))) {
        continue;
      }

      // Type validation
      if (type && typeof value !== type) {
        errors.push({
          field,
          message: `${field} must be a ${type}`
        });
        continue;
      }

      // String validations
      if (typeof value === 'string') {
        // Trim the value for validation
        const trimmedValue = value.trim();

        // Min length
        if (minLength && trimmedValue.length < minLength) {
          errors.push({
            field,
            message: `${field} must be at least ${minLength} characters long`
          });
        }

        // Max length
        if (maxLength && trimmedValue.length > maxLength) {
          errors.push({
            field,
            message: `${field} cannot exceed ${maxLength} characters`
          });
        }

        // Pattern validation (regex)
        if (pattern && !pattern.test(trimmedValue)) {
          errors.push({
            field,
            message: rule.patternMessage || `${field} format is invalid`
          });
        }
      }

      // Custom validation
      if (custom && typeof custom === 'function') {
        const customError = custom(value, req.body);
        if (customError) {
          errors.push({
            field,
            message: customError
          });
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
        data: null
      });
    }

    next();
  };
};

// Specific validation rules for common use cases
export const authValidationRules = {
  register: [
    {
      field: 'name',
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
      patternMessage: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    },
    {
      field: 'email',
      type: 'string',
      required: true,
      maxLength: 255,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Please provide a valid email address'
    },
    {
      field: 'password',
      type: 'string',
      required: true,
      minLength: 6,
      maxLength: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
      patternMessage: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    },
    {
      field: 'confirmPassword',
      type: 'string',
      required: true,
      custom: (value, body) => {
        if (value !== body.password) {
          return 'Passwords do not match';
        }
        return null;
      }
    }
  ],
  
  login: [
    {
      field: 'email',
      type: 'string',
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Please provide a valid email address'
    },
    {
      field: 'password',
      type: 'string',
      required: true,
      minLength: 1
    }
  ],

  updateProfile: [
    {
      field: 'name',
      type: 'string',
      required: false,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
      patternMessage: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    },
    {
      field: 'email',
      type: 'string',
      required: false,
      maxLength: 255,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Please provide a valid email address'
    }
  ],

  updatePassword: [
    {
      field: 'currentPassword',
      type: 'string',
      required: true,
      minLength: 1
    },
    {
      field: 'newPassword',
      type: 'string',
      required: true,
      minLength: 6,
      maxLength: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
      patternMessage: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    },
    {
      field: 'confirmPassword',
      type: 'string',
      required: true,
      custom: (value, body) => {
        if (value !== body.newPassword) {
          return 'Passwords do not match';
        }
        return null;
      }
    }
  ]
};

// Contact validation rules
export const contactValidationRules = {
  create: [
    {
      field: 'name',
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 100
    },
    {
      field: 'phoneNumber',
      type: 'string',
      required: true,
      pattern: /^\+?[1-9]\d{1,14}$/,
      patternMessage: 'Please provide a valid phone number in international format'
    },
    {
      field: 'email',
      type: 'string',
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Please provide a valid email address'
    },
    {
      field: 'company',
      type: 'string',
      required: false,
      maxLength: 100
    }
  ],

  update: [
    {
      field: 'name',
      type: 'string',
      required: false,
      minLength: 2,
      maxLength: 100
    },
    {
      field: 'phoneNumber',
      type: 'string',
      required: false,
      pattern: /^\+?[1-9]\d{1,14}$/,
      patternMessage: 'Please provide a valid phone number in international format'
    },
    {
      field: 'email',
      type: 'string',
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Please provide a valid email address'
    },
    {
      field: 'company',
      type: 'string',
      required: false,
      maxLength: 100
    }
  ]
};

// Rate limiting middleware
export const rateLimit = (options = {}) => {
  const { 
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = "Too many requests, please try again later",
    skipSuccessfulRequests = false
  } = options;

  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [ip, data] of requests.entries()) {
      data.requests = data.requests.filter(time => time > windowStart);
      if (data.requests.length === 0) {
        requests.delete(ip);
      }
    }

    // Get or create request data for this IP
    if (!requests.has(key)) {
      requests.set(key, { requests: [] });
    }

    const requestData = requests.get(key);
    requestData.requests = requestData.requests.filter(time => time > windowStart);

    // Check if limit exceeded
    if (requestData.requests.length >= max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request
    requestData.requests.push(now);

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': Math.max(0, max - requestData.requests.length),
      'X-RateLimit-Reset': Math.ceil((windowStart + windowMs) / 1000)
    });

    next();
  };
};

export default {
  validateRequest,
  authValidationRules,
  contactValidationRules,
  rateLimit
};
