// ValidationService.js
// Purpose: Centralized schema/data validation utilities.

import Joi from 'joi';

export class ValidationService {
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid
   */
  static isValidEmail(email) {
    const schema = Joi.string().email().required();
    const { error } = schema.validate(email);
    return !error;
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - True if valid
   */
  static isValidPhone(phone) {
    const schema = Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).required();
    const { error } = schema.validate(phone);
    return !error;
  }

  /**
   * Validate date format and ensure it's in the future
   * @param {string} date - Date to validate
   * @param {boolean} allowPast - Allow past dates
   * @returns {boolean} - True if valid
   */
  static isValidFutureDate(date, allowPast = false) {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return false;
      }

      if (!allowPast && dateObj <= new Date()) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate date range (start date before end date)
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {boolean} - True if valid
   */
  static isValidDateRange(startDate, endDate) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return false;
      }

      return start < end;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} - Validation result with details
   */
  static validatePasswordStrength(password) {
    const result = {
      isValid: false,
      score: 0,
      requirements: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecialChar: false
      },
      suggestions: []
    };

    if (!password) {
      result.suggestions.push('Password is required');
      return result;
    }

    // Check minimum length
    if (password.length >= 8) {
      result.requirements.minLength = true;
      result.score += 1;
    } else {
      result.suggestions.push('Password must be at least 8 characters long');
    }

    // Check for uppercase letters
    if (/[A-Z]/.test(password)) {
      result.requirements.hasUppercase = true;
      result.score += 1;
    } else {
      result.suggestions.push('Password must contain at least one uppercase letter');
    }

    // Check for lowercase letters
    if (/[a-z]/.test(password)) {
      result.requirements.hasLowercase = true;
      result.score += 1;
    } else {
      result.suggestions.push('Password must contain at least one lowercase letter');
    }

    // Check for numbers
    if (/\d/.test(password)) {
      result.requirements.hasNumber = true;
      result.score += 1;
    } else {
      result.suggestions.push('Password must contain at least one number');
    }

    // Check for special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      result.requirements.hasSpecialChar = true;
      result.score += 1;
    } else {
      result.suggestions.push('Password must contain at least one special character');
    }

    // Password is valid if it meets at least 4 out of 5 requirements
    result.isValid = result.score >= 4;

    return result;
  }

  /**
   * Validate UUID format
   * @param {string} uuid - UUID to validate
   * @returns {boolean} - True if valid
   */
  static isValidUUID(uuid) {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidPattern.test(uuid);
  }

  /**
   * Validate rating (1-5 scale)
   * @param {number} rating - Rating to validate
   * @returns {boolean} - True if valid
   */
  static isValidRating(rating) {
    return typeof rating === 'number' && rating >= 1 && rating <= 5 && Number.isInteger(rating);
  }

  /**
   * Validate capacity (positive integer)
   * @param {number} capacity - Capacity to validate
   * @returns {boolean} - True if valid
   */
  static isValidCapacity(capacity) {
    return typeof capacity === 'number' && capacity > 0 && Number.isInteger(capacity);
  }

  /**
   * Sanitize string input (remove harmful characters)
   * @param {string} input - Input to sanitize
   * @returns {string} - Sanitized input
   */
  static sanitizeString(input) {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  }

  /**
   * Validate text length
   * @param {string} text - Text to validate
   * @param {number} minLength - Minimum length
   * @param {number} maxLength - Maximum length
   * @returns {boolean} - True if valid
   */
  static isValidTextLength(text, minLength = 0, maxLength = 1000) {
    if (typeof text !== 'string') {
      return false;
    }

    const length = text.trim().length;
    return length >= minLength && length <= maxLength;
  }

  /**
   * Validate enum value
   * @param {any} value - Value to validate
   * @param {array} allowedValues - Array of allowed values
   * @returns {boolean} - True if valid
   */
  static isValidEnum(value, allowedValues) {
    return allowedValues.includes(value);
  }

  /**
   * Validate object structure using Joi schema
   * @param {object} data - Data to validate
   * @param {object} schema - Joi schema
   * @returns {object} - Validation result
   */
  static validateSchema(data, schema) {
    const { error, value } = schema.validate(data, { 
      abortEarly: false,
      stripUnknown: true
    });

    return {
      isValid: !error,
      errors: error ? error.details.map(detail => detail.message) : [],
      data: value
    };
  }

  /**
   * Get common validation schemas
   * @returns {object} - Object containing common Joi schemas
   */
  static getCommonSchemas() {
    return {
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]{10,15}$/).required(),
      password: Joi.string().min(8).required(),
      uuid: Joi.string().uuid().required(),
      url: Joi.string().uri(),
      rating: Joi.number().integer().min(1).max(5).required(),
      capacity: Joi.number().integer().positive().required(),
      futureDate: Joi.date().greater('now').required(),
      pastOrPresentDate: Joi.date().max('now').required(),
      title: Joi.string().min(3).max(200).required(),
      description: Joi.string().max(2000),
      name: Joi.string().min(2).max(100).required(),
      shortText: Joi.string().max(255),
      longText: Joi.string().max(5000),
      positiveNumber: Joi.number().positive(),
      nonNegativeNumber: Joi.number().min(0)
    };
  }
}

export default ValidationService;
