import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import assetRoutes from './routes/assetRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables from .env file
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// ES modules __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/assets', assetRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Global Error Handler Middleware
// Must be placed after all routes to catch their errors
app.use(errorHandler);

// Port configuration
const PORT = process.env.PORT || 1999;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
