# W-API Calls Backend - MVC Architecture

## 🏗️ Architecture Overview

The backend has been restructured to follow the **Model-View-Controller (MVC)** pattern for better organization, maintainability, and scalability.

### 📁 Folder Structure

```
backend/
├── controllers/           # Business logic handlers
│   ├── authController.js     # Authentication logic
│   ├── contactController.js  # Contact management
│   └── callController.js     # Call management
├── models/               # Database schemas
│   ├── User.js              # User authentication model
│   ├── Contact.js           # Contact management model
│   ├── Call.js              # Call records model
│   ├── Campaign.js          # Campaign management model
│   └── index.js             # Model exports
├── routes/               # API route definitions
│   ├── auth.js              # Authentication routes
│   ├── contacts.js          # Contact routes
│   └── calls.js             # Call routes
├── middleware/           # Custom middleware
│   ├── auth.js              # Authentication middleware
│   └── error.js             # Error handling middleware
├── services/             # External services
│   └── vapiClient.js        # VAPI integration
├── utils/                # Utility functions
│   └── vapiEvents.js        # VAPI event processing
├── server.js             # Main server file
├── server_old.js         # Backup of original server
└── .env.example          # Environment variables template
```

## 🔐 Authentication System

### Features
- **JWT-based authentication** with secure cookie storage
- **Password hashing** using bcryptjs
- **User registration and login**
- **Protected routes** with middleware
- **Password update** functionality
- **User profile management**

### API Endpoints

#### Public Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Protected Routes
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Usage Example

```javascript
// Register a new user
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}

// Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

## 👥 Contact Management

### Features
- **CRUD operations** for contacts
- **Search and filtering**
- **Pagination support**
- **Bulk import** functionality
- **Phone number validation**
- **User-scoped contacts** (each user sees only their contacts)

### API Endpoints
- `GET /api/contacts` - List contacts with pagination/filtering
- `POST /api/contacts` - Create new contact
- `GET /api/contacts/:id` - Get single contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact
- `POST /api/contacts/bulk-import` - Bulk import contacts

### Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term (name, email, company, phone)
- `status` - Filter by status (active, inactive, blocked)
- `source` - Filter by source (manual, import, api, web_form)
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - Sort direction (asc, desc)

## 📞 Call Management

### Features
- **VAPI integration** for outbound calls
- **Call status tracking** (initiated, ringing, in-progress, completed, etc.)
- **Transcript capture** and storage
- **Phone number formatting** (E.164 format)
- **Assistant configuration** via environment variables
- **Real-time status updates** via webhooks

### API Endpoints
- `GET /api/calls` - List calls with pagination/filtering
- `POST /api/calls` - Create new outbound call
- `GET /api/calls/:id` - Get single call details
- `PUT /api/calls/:id` - Update call notes/tags
- `DELETE /api/calls/:id` - Delete call record

### Creating a Call

```javascript
POST /api/calls
{
  "contactId": "contact_id_here",  // OR provide name + phoneNumber
  "name": "John Doe",              // Required if no contactId
  "phoneNumber": "+1234567890",    // Required if no contactId
  "assistantOverrides": {          // Optional VAPI assistant overrides
    "firstMessage": "Hello John!",
    "voice": {
      "stability": 0.8,
      "similarityBoost": 0.9
    }
  }
}
```

## 🔒 Authentication Middleware

The `protect` middleware ensures routes are accessible only to authenticated users:

```javascript
import { protect } from "../middleware/auth.js";

// Protect all routes in a router
router.use(protect);

// Or protect individual routes
router.get("/protected-route", protect, controllerFunction);
```

## 🗄️ Database Models

### User Model
- Authentication and user management
- Password hashing and comparison
- JWT token generation
- Profile management

### Contact Model
- Contact information storage
- Search indexing
- User association
- Custom fields support

### Call Model
- VAPI call integration
- Status and transcript tracking
- Duration and cost tracking
- User and contact associations

### Campaign Model
- Campaign management (for future use)
- Contact grouping
- Statistics tracking
- Team collaboration

## 🔧 Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/wapicalls

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=30d

# VAPI
VAPI_API_KEY=your_vapi_api_key_here
VAPI_ASSISTANT_ID=your_assistant_id_here
VAPI_PHONE_NUMBER_ID=your_phone_number_id_here

# Frontend
FRONTEND_URL=http://localhost:5173
```

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Test the API:**
   ```bash
   # Health check
   curl http://localhost:5000/api/health
   
   # Register a user
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123","confirmPassword":"password123"}'
   ```

## 📋 Migration from Legacy Code

The original `server.js` has been backed up as `server_old.js`. Key changes:

### Before (Monolithic)
- All logic in one file (795 lines)
- No authentication system
- Basic contact/call management
- Mixed concerns

### After (MVC)
- **Separated concerns** into models, controllers, routes
- **Complete authentication system** with JWT
- **Enhanced error handling** and validation
- **Scalable architecture** for future features
- **Better code organization** and maintainability

## 🔄 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... }  // For paginated endpoints
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## 🧪 Testing Endpoints

Use tools like Postman, curl, or REST Client to test the API endpoints. Remember to:

1. **Register/Login** first to get authentication token
2. **Include Authorization header** for protected routes:
   ```
   Authorization: Bearer your_jwt_token_here
   ```
3. **Use proper Content-Type** for JSON requests:
   ```
   Content-Type: application/json
   ```

## 🔮 Future Enhancements

The MVC structure enables easy addition of:
- **Campaign management** (model already created)
- **Analytics and reporting**
- **Team collaboration**
- **API rate limiting**
- **Advanced search and filtering**
- **Webhook management**
- **Email notifications**
- **Call scheduling**

## 📝 Notes

- **Backward compatibility** maintained for VAPI webhook endpoints
- **In-memory fallback** still available if MongoDB is unavailable
- **Comprehensive logging** for debugging and monitoring
- **Production-ready** error handling and validation
