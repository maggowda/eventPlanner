// responseHelper.js
// Purpose: Standardize API response formats and HTTP status handling.

/**
 * Standard response helper for consistent API responses
 */
export class ResponseHelper {
  /**
   * Send a successful response
   * @param {object} res - Express response object
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send an error response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {any} errors - Additional error details
   */
  static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send a validation error response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   * @param {any} validationErrors - Validation error details
   */
  static validationError(res, message = 'Validation failed', validationErrors = null) {
    return this.error(res, message, 400, validationErrors);
  }

  /**
   * Send an unauthorized response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   */
  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, message, 401);
  }

  /**
   * Send a forbidden response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   */
  static forbidden(res, message = 'Access forbidden') {
    return this.error(res, message, 403);
  }

  /**
   * Send a not found response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  /**
   * Send a conflict response
   * @param {object} res - Express response object
   * @param {string} message - Error message
   */
  static conflict(res, message = 'Resource conflict') {
    return this.error(res, message, 409);
  }

  /**
   * Send a created response
   * @param {object} res - Express response object
   * @param {any} data - Created resource data
   * @param {string} message - Success message
   */
  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * Send a no content response
   * @param {object} res - Express response object
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Handle async route errors
   * @param {function} fn - Async route handler
   * @returns {function} - Express middleware function
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Create a standardized error object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code
   * @returns {Error} - Error object with additional properties
   */
  static createError(message, statusCode = 500, code = null) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.code = code;
    return error;
  }
}

export default ResponseHelper;
