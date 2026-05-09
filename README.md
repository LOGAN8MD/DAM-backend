# Digital Asset Manager - Backend

This is the Express.js backend for the Digital Asset Manager project. It provides RESTful APIs to handle file uploads, metadata storage in MongoDB, and advanced search functionality.

## Features

- **File Uploads**: Handles multipart/form-data uploads using `multer`.
- **Validation**: Strict file type validation (Images, PDFs, Videos) and size limits (max 50MB).
- **Metadata Storage**: Uses Mongoose to store asset metadata (filename, original name, size, type, tags, upload date) in MongoDB.
- **Search & Filtering**: Search assets by filename, file type, upload date range, or tags.
- **Global Error Handling**: Centralized Express error handler to catch and format MongoDB, Multer, and internal server errors.
- **Static File Serving**: Safely serves uploaded assets for frontend viewing.

## Prerequisites

- Node.js (v14 or higher recommended)
- MongoDB (Atlas cluster or local instance)

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root of the `backend` directory with the following variables:
```env
PORT=1999
MONGO_URI=your_mongodb_connection_string_here
```

### 3. Start the Server
Start the development server using nodemon:
```bash
npm run dev
```
The server will start on `http://localhost:1999`.

## API Endpoints

- **POST `/api/assets/upload`**: Upload a new asset. Accepts a `file` field in `multipart/form-data`.
- **GET `/api/assets`**: Fetch all assets.
- **GET `/api/assets/search`**: Search/filter assets. Query parameters: `q`, `fileType`, `startDate`, `endDate`, `tags`.
- **GET `/api/assets/download/:filename`**: Download a specific asset.

## Built With
- Express.js
- Mongoose
- Multer
- dotenv
- cors
