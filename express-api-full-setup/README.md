# Express.js Api Boilerplate

## 🗃️ Back-Logs:
- Setup Uploadthing Storage
- Setup Appwrite Storage
- Setup Firebase Storage
- Password Reset Feature
- Refresh Token Feature

## Overview
🚀 This API Boilerplate, built using Express.js, simplifies the creation of REST APIs. It's designed to streamline the process of developing APIs by providing pre-written code for common tasks, including route creation, middleware implementation, authentication setup, account confirmation email sending, and file uploading with multer.

## Project Structure
```
.
├── install.sh                // For install latest version of dependencies
├── nodemon.json              // Configuration file for nodemon
├── package-lock.json
├── package.json
├── public                    // Contains publicly accessible files
├── README.md
├── src
│   ├── app.js
│   ├── controllers            // Contains controller logic for handling HTTP requests
│   │   ├── userController.js // Controller for user-related operations
│   │   └── v1                // Version-specific controllers (if applicable)
│   │       └── README.md     // Documentation for version-specific controllers
│   ├── database               // Database-related logic and database connection setup
│   │   ├── User.js           // Database operations related to user management
│   │   └── db-connect.js     // Database connection setup
│   ├── index.js               // Entry point of the application
│   ├── middlewares            // Middleware functions for request processing
│   │   ├── authMiddleware.js       // Authentication middleware
│   │   ├── multerMiddleware.js     // Middleware for handling file uploads (if applicable)
│   │   ├── notFoundErrorHandler.js // Middleware for handling 404 errors
│   │   └── otherErrorHandler.js    // Other error handling middleware
│   ├── models                 // Database models/schema definitions
│   │   └── UserModel.js      // User model definition
│   ├── routes                 // Route definitions for different API endpoints
│   │   ├── index.js          // Main router file
│   │   ├── userRoutes.js     // Routes related to user management
│   │   └── v1                // Version-specific routes (if applicable)
│   │       └── README.md     // Documentation for version-specific routes
│   ├── services               // Service layer containing business logic
│   │   ├── userService.js    // Service functions for user-related operations
│   │   └── v1                // Version-specific services (if applicable)
│   │       └── README.md     // Documentation for version-specific services
│   └── utils                  // Utility functions and helper modules
│       ├── ApiError.js        // Custom API error handler
│       ├── ApiResponse.js    // Response format utility
│       ├── CustomError.js    // Custom error class definition
│       ├── cloudinary.js     // Cloudinary integration for file storage (if applicable)
│       ├── constants.js      // Constant values used throughout the application
│       ├── corsOptions.js    // CORS configuration options
│       ├── emailTemplates.js // Email template generation functions
│       ├── helpers.js        // Miscellaneous helper functions
│       ├── limiter.js        // Rate limiting configuration
│       └── sendEmail.js      // Email sending functionality
└── swagger.json              // Swagger/OpenAPI specification file
```

## Installation
To install dependencies, run the `install.sh` script:
```bash
./install.sh
```

## .env Setup
```
View .env.sample for .env setup
```

## Usage
To start the server, run:
```bash
npm run dev
```

