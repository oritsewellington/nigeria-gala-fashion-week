/**
 * AppError - operational error class.
 * Any error we THROW intentionally (validation, not found, forbidden, etc.)
 * should be an AppError so the global handler knows it's safe to show
 * the message to the client. Anything else (raw Mongoose/DB errors,
 * programming bugs) gets masked with a generic message.
 */
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // marks this as a "safe to show" error
    this.code = code || null; // optional machine-readable code e.g. 'NOT_FOUND'

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
