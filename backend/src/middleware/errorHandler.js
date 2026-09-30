const AppError = require('../utils/AppError');

/**
 * Converts known "raw" errors (Mongoose, JWT, Multer, etc.) into safe
 * AppError instances with clean, user-facing messages. Anything not
 * recognized falls through as an unknown 500.
 */
const normalizeError = (err) => {
  // Mongoose bad ObjectId (e.g. /api/contestants/123abc)
  if (err.name === 'CastError') {
    return new AppError('The requested resource was not found.', 404, 'NOT_FOUND');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new AppError(messages.join('. '), 400, 'VALIDATION_ERROR');
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return new AppError(`That ${field} is already in use.`, 409, 'DUPLICATE_FIELD');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return new AppError('You are not logged in. Please log in to continue.', 401, 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    return new AppError('Your session has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
  }

  // Mongo connection / server selection issues (timeouts talking to DB)
  if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError') {
    return new AppError('The server is taking too long to respond. Please try again shortly.', 503, 'SERVICE_UNAVAILABLE');
  }

  // Request timeout (if using a timeout middleware/proxy)
  if (err.code === 'ETIMEDOUT' || err.type === 'request.timeout') {
    return new AppError('This request took too long and timed out. Please try again.', 408, 'REQUEST_TIMEOUT');
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    return new AppError('There was a problem with your file upload. Please try a smaller image.', 400, 'UPLOAD_ERROR');
  }

  // Already a clean operational error we threw ourselves
  if (err.isOperational) {
    return err;
  }

  // Unknown / programming error -> never leak details
  return new AppError('Something went wrong on our end. Please try again shortly.', 500, 'INTERNAL_ERROR');
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const safeError = normalizeError(err);

  // Log the REAL error server-side for debugging (never sent to client)
  if (safeError.statusCode >= 500) {
    console.error('[ERROR]', {
      path: req.originalUrl,
      method: req.method,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  res.status(safeError.statusCode).json({
    success: false,
    status: safeError.status,
    code: safeError.code,
    message: safeError.message,
  });
};

// 404 handler for unmatched routes
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404, 'NOT_FOUND'));
};

module.exports = { errorHandler, notFound };
