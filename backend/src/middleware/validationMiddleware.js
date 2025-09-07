// validationMiddleware.js
// Purpose: Wrap validators and send standardized validation error responses.

import ResponseHelper from '../utils/responseHelper.js';

/**
 * Validation middleware
 */
export class ValidationMiddleware {
  /**
   * Validate request body using a validator function
   * @param {function} validator - Validation function
   * @returns {function} - Express middleware function
   */
  static validateBody(validator) {
    return (req, res, next) => {
      try {
        const result = validator(req.body);
        
        if (result.error) {
          const errors = result.error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }));
          
          return ResponseHelper.validationError(res, 'Validation failed', errors);
        }

        req.validatedBody = result.value;
        next();
      } catch (error) {
        console.error('Validation middleware error:', error);
        return ResponseHelper.error(res, 'Validation error', 500);
      }
    };
  }

  /**
   * Validate request parameters using a validator function
   * @param {function} validator - Validation function
   * @returns {function} - Express middleware function
   */
  static validateParams(validator) {
    return (req, res, next) => {
      try {
        const result = validator(req.params);
        
        if (result.error) {
          const errors = result.error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }));
          
          return ResponseHelper.validationError(res, 'Parameter validation failed', errors);
        }

        req.validatedParams = result.value;
        next();
      } catch (error) {
        console.error('Parameter validation middleware error:', error);
        return ResponseHelper.error(res, 'Parameter validation error', 500);
      }
    };
  }

  /**
   * Validate request query parameters using a validator function
   * @param {function} validator - Validation function
   * @returns {function} - Express middleware function
   */
  static validateQuery(validator) {
    return (req, res, next) => {
      try {
        const result = validator(req.query);
        
        if (result.error) {
          const errors = result.error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }));
          
          return ResponseHelper.validationError(res, 'Query validation failed', errors);
        }

        req.validatedQuery = result.value;
        next();
      } catch (error) {
        console.error('Query validation middleware error:', error);
        return ResponseHelper.error(res, 'Query validation error', 500);
      }
    };
  }

  /**
   * Validate multiple parts of request (body, params, query)
   * @param {object} validators - Object with body, params, and/or query validators
   * @returns {function} - Express middleware function
   */
  static validate(validators) {
    return (req, res, next) => {
      try {
        const errors = [];

        // Validate body
        if (validators.body) {
          const bodyResult = validators.body(req.body);
          if (bodyResult.error) {
            errors.push(...bodyResult.error.details.map(detail => ({
              field: `body.${detail.path.join('.')}`,
              message: detail.message
            })));
          } else {
            req.validatedBody = bodyResult.value;
          }
        }

        // Validate params
        if (validators.params) {
          const paramsResult = validators.params(req.params);
          if (paramsResult.error) {
            errors.push(...paramsResult.error.details.map(detail => ({
              field: `params.${detail.path.join('.')}`,
              message: detail.message
            })));
          } else {
            req.validatedParams = paramsResult.value;
          }
        }

        // Validate query
        if (validators.query) {
          const queryResult = validators.query(req.query);
          if (queryResult.error) {
            errors.push(...queryResult.error.details.map(detail => ({
              field: `query.${detail.path.join('.')}`,
              message: detail.message
            })));
          } else {
            req.validatedQuery = queryResult.value;
          }
        }

        if (errors.length > 0) {
          return ResponseHelper.validationError(res, 'Validation failed', errors);
        }

        next();
      } catch (error) {
        console.error('Combined validation middleware error:', error);
        return ResponseHelper.error(res, 'Validation error', 500);
      }
    };
  }

  /**
   * Simple validation for common patterns
   */
  static patterns = {
    /**
     * Validate UUID parameter
     * @param {string} paramName - Parameter name
     * @returns {function} - Express middleware function
     */
    uuid(paramName = 'id') {
      return (req, res, next) => {
        const value = req.params[paramName];
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        
        if (!value || !uuidRegex.test(value)) {
          return ResponseHelper.validationError(res, 'Invalid UUID format', [
            { field: paramName, message: `${paramName} must be a valid UUID` }
          ]);
        }
        
        next();
      };
    },

    /**
     * Validate email in request body
     * @param {string} fieldName - Field name
     * @returns {function} - Express middleware function
     */
    email(fieldName = 'email') {
      return (req, res, next) => {
        const value = req.body[fieldName];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (value && !emailRegex.test(value)) {
          return ResponseHelper.validationError(res, 'Invalid email format', [
            { field: fieldName, message: `${fieldName} must be a valid email address` }
          ]);
        }
        
        next();
      };
    },

    /**
     * Validate required fields in request body
     * @param {array} fields - Array of required field names
     * @returns {function} - Express middleware function
     */
    required(fields) {
      return (req, res, next) => {
        const errors = [];
        
        fields.forEach(field => {
          if (!req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
            errors.push({
              field,
              message: `${field} is required`
            });
          }
        });
        
        if (errors.length > 0) {
          return ResponseHelper.validationError(res, 'Required fields missing', errors);
        }
        
        next();
      };
    },

    /**
     * Validate positive integer
     * @param {string} fieldName - Field name
     * @param {boolean} required - Whether field is required
     * @returns {function} - Express middleware function
     */
    positiveInteger(fieldName, required = false) {
      return (req, res, next) => {
        const value = req.body[fieldName] || req.query[fieldName] || req.params[fieldName];
        
        if (required && (value === undefined || value === null)) {
          return ResponseHelper.validationError(res, 'Validation failed', [
            { field: fieldName, message: `${fieldName} is required` }
          ]);
        }
        
        if (value !== undefined && value !== null) {
          const num = parseInt(value, 10);
          if (isNaN(num) || num <= 0) {
            return ResponseHelper.validationError(res, 'Validation failed', [
              { field: fieldName, message: `${fieldName} must be a positive integer` }
            ]);
          }
        }
        
        next();
      };
    }
  };
}

// Export individual methods for easier usage
export const validateBody = ValidationMiddleware.validateBody;
export const validateParams = ValidationMiddleware.validateParams;
export const validateQuery = ValidationMiddleware.validateQuery;
export const validate = ValidationMiddleware.validate;
export const patterns = ValidationMiddleware.patterns;

export default ValidationMiddleware;
