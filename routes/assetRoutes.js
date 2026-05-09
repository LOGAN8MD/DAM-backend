import express from 'express';
import { uploadMiddleware } from '../middleware/upload.js';
import { uploadAsset, getAssets, downloadAsset, searchAssets, getAssetMetadata } from '../controllers/assetController.js';

const router = express.Router();

// @route   POST /api/assets/upload
// @desc    Upload a single file
router.post('/upload', uploadMiddleware, uploadAsset);

// @route   GET /api/assets/search
// @desc    Search assets by multiple parameters
router.get('/search', searchAssets);

// @route   GET /api/assets/metadata
// @desc    Get unique tags and names for autocomplete
router.get('/metadata', getAssetMetadata);



// @route   GET /api/assets/download/:filename
// @desc    Download an asset
router.get('/download/:filename', downloadAsset);

// @route   GET /api/assets
// @desc    Get all assets with optional filters
router.get('/', getAssets);

export default router;
