import Asset from '../models/Asset.js';
import path from 'path';
import fs from 'fs';

// @desc    Upload a new asset
// @route   POST /api/assets/upload
// @access  Public
export const uploadAsset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded or invalid file type' });
    }

    // Construct file URL
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    const newAsset = new Asset({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileUrl: fileUrl,
      // Parse tags if provided in the body (e.g., 'tag1, tag2')
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
    });

    const savedAsset = await newAsset.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      asset: savedAsset
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all assets with optional filters
// @route   GET /api/assets
// @access  Public
export const getAssets = async (req, res, next) => {
  try {
    const { fileType, startDate, endDate, tags } = req.query;
    let query = {};

    // Filter by fileType (e.g., 'image', 'video', 'pdf', or exact mime type)
    if (fileType) {
      query.fileType = { $regex: fileType, $options: 'i' };
    }

    // Filter by date range
    if (startDate || endDate) {
      query.uploadDate = {};
      if (startDate) {
        query.uploadDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.uploadDate.$lte = new Date(endDate);
      }
    }

    // Filter by tags
    if (tags) {
      // Assuming tags are passed as a comma-separated string: ?tags=nature,holiday
      const tagsArray = tags.split(',').map(tag => tag.trim());
      // Find assets that have AT LEAST ONE of the specified tags
      query.tags = { $in: tagsArray };
    }

    // Fetch matching assets, sorted by newest first
    const assets = await Asset.find(query).sort({ uploadDate: -1 });

    res.status(200).json({
      count: assets.length,
      assets: assets
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Download a specific asset by filename
// @route   GET /api/assets/download/:filename
// @access  Public
export const downloadAsset = (req, res, next) => {
  try {
    const filename = req.params.filename;
    // path.resolve starts from the current working directory (backend folder)
    const filePath = path.resolve('uploads', filename);

    if (fs.existsSync(filePath)) {
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error(`Download error: ${err.message}`);
          // Prevent setting headers twice if response already started
          if (!res.headersSent) {
            res.status(500).json({ message: 'Problem downloading the file' });
          }
        }
      });
    } else {
      res.status(404).json({ message: 'File not found on server' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Search assets by filename, fileType, or tags
// @route   GET /api/assets/search
// @access  Public
export const searchAssets = async (req, res, next) => {
  try {
    const { filename, fileType, tags, q } = req.query;
    let query = {};

    // If a generic 'q' parameter is provided, search across filename and tags
    if (q) {
      query.$or = [
        { filename: { $regex: q, $options: 'i' } },
        { originalName: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    } else {
      // Otherwise, filter by specific fields
      if (filename) {
        query.$or = [
          { filename: { $regex: filename, $options: 'i' } },
          { originalName: { $regex: filename, $options: 'i' } }
        ];
      }
      if (fileType) {
        query.fileType = { $regex: fileType, $options: 'i' };
      }
      if (tags) {
        const tagsArray = tags.split(',').map(tag => tag.trim());
        query.tags = { $in: tagsArray };
      }
    }

    const assets = await Asset.find(query).sort({ uploadDate: -1 });

    res.status(200).json({
      count: assets.length,
      assets: assets
    });

  } catch (error) {
    next(error);
  }
};
