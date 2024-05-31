# Express.js REST Api Boilerplate

## Overview
🚀 This API Boilerplate built using Express.js, simplifies the creation of REST APIs. It's designed to streamline the process of developing APIs by providing pre-written code for common tasks, including route creation, middleware implementation, authentication setup, account confirmation email sending, and file uploading with multer & much more.

## Project Structure
```sh
.
├── README.md               // Documentation for the project
├── install.sh              // Script for installing the latest version of dependencies
├── nodemon.json            // Configuration file for nodemon
├── package-lock.json       // Dependency tree, ensuring consistent installs
├── package.json            // Project metadata and dependencies
├── push.sh                 // Script for pushing code to a repository
├── src
│   ├── app.js              // Main application file, initializes the app
│   ├── constants
│   │   └── index.js        // Stores constants used throughout the application
│   ├── controllers         // Contains logic for handling HTTP requests
│   │   ├── adminController.js // Controller for admin-related operations
│   │   └── v1
│   │       └── userController.js // Controller for version 1 user-related operations
│   ├── createAdminUser.js  // A Node.js script for creating an admin user
│   ├── database
│   │   └── connect-db.js   // Database connection setup
│   ├── index.js            // Entry point of the application
│   ├── middlewares         // Middleware functions for request processing
│   │   ├── isOwner.js      // Middleware to check if the user is the owner of a resource
│   │   ├── multerMiddleware.js  // Middleware for handling file uploads
│   │   ├── notFoundErrorHandler.js // Middleware for handling 404 errors
│   │   ├── otherErrorHandler.js    // Middleware for handling other errors
│   │   └── verifyToken.js  // Middleware to verify authentication tokens
│   ├── models              // Database models/schema definitions
│   │   └── UserModel.js    // User model definition
│   ├── routes              // Route definitions for different API endpoints
│   │   ├── adminRoutes.js  // Routes related to admin operations
│   │   ├── index.js        // File 
│   │   └── v1
│   │       └── userRoutes.js // Routes related to version 1 user operations
│   └── utils               // Utility functions and helper modules
│       ├── ApiError.js     // Custom API error handler
│       ├── ApiResponse.js  // Response format utility
│       ├── cloudinary.js   // Cloudinary integration for file storage
│       ├── corsOptions.js  // CORS configuration options
│       ├── emailTemplates.js // Email template generation functions
│       ├── helpers.js      // Miscellaneous helper functions
│       ├── limiter.js      // Rate limiting configuration
│       ├── sendEmail.js    // Email sending functionality
│       └── validator.js    // Validation functions
├── swagger.json            // Swagger/OpenAPI specification file
```

## Installation
To install dependencies, run the `install.sh` script:
```bash
bash install.sh
```

## .env Setup
```
View .env.sample for .env setup
```

## Usage
- To start the server, run:
```bash
npm run dev
```

- To create an Admin User:
```bash
npm run create-admin
```
