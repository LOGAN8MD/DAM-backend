export const errorHandler = (err, req, res, next) => {
  // Set default status code to 500 if it hasn't been set by a previous route
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // 1. Handle Multer File Upload Errors (e.g. file too large)
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size is too large. Maximum allowed size is 50MB.';
    } else {
      message = err.message;
    }
  }

  // 2. Handle Custom File Type Error from Multer Config
  if (err.message && err.message.includes('Only Images, PDFs, and Video files are allowed')) {
    statusCode = 400;
    message = err.message.replace('Error: ', '');
  }

  // 3. Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // 4. Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered.';
  }

  // 5. Handle Mongoose CastError (e.g., Invalid ID format)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found / Invalid ID format.';
  }

  console.error(`[Error Handler] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    message: message,
    // Only show the stack trace if we are in development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
