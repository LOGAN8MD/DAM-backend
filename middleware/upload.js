import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Format: fieldname-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Configure File Filter for Images, PDFs, and Videos
const fileFilter = (req, file, cb) => {
  // Allowed ext
  const extRegex = /jpeg|jpg|png|gif|webp|pdf|mp4|mkv|avi|mov/;
  const extname = extRegex.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime
  const mimeRegex = /image\/.*|video\/.*|application\/pdf/;
  const mimetype = mimeRegex.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only Images, PDFs, and Video files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB limit
  }
});

// Wrapper middleware to explicitly catch and send errors
export const uploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading (e.g., size limit)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size is too large. Maximum allowed size is 50MB.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // An unknown error occurred or our custom fileFilter error
      if (err.message.includes('Only Images, PDFs, and Video files are allowed')) {
        return res.status(400).json({ message: err.message.replace('Error: ', '') });
      }
      return res.status(400).json({ message: err.message });
    }
    // Everything went fine
    next();
  });
};
