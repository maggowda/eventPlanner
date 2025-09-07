// studentValidators.js
// Purpose: Validation schemas for student-related requests.

import Joi from 'joi';

/**
 * Student validation schemas
 */
export class StudentValidators {
  // Create student validation schema
  static createStudentSchema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .pattern(/^[a-zA-Z\s'.-]+$/)
      .required()
      .messages({
        'string.min': 'Student name must be at least 2 characters long',
        'string.max': 'Student name cannot exceed 100 characters',
        'string.pattern.base': 'Student name can only contain letters, spaces, apostrophes, periods, and hyphens',
        'any.required': 'Student name is required'
      }),
    
    email: Joi.string()
      .email()
      .max(255)
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.max': 'Email cannot exceed 255 characters',
        'any.required': 'Email is required'
      }),
    
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]{10,}$/)
      .messages({
        'string.pattern.base': 'Please provide a valid phone number (at least 10 digits)'
      }),
    
    college_id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.uuid': 'College ID must be a valid UUID',
        'any.required': 'College ID is required'
      })
  });

  // Update student validation schema
  static updateStudentSchema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .pattern(/^[a-zA-Z\s'.-]+$/)
      .messages({
        'string.min': 'Student name must be at least 2 characters long',
        'string.max': 'Student name cannot exceed 100 characters',
        'string.pattern.base': 'Student name can only contain letters, spaces, apostrophes, periods, and hyphens'
      }),
    
    email: Joi.string()
      .email()
      .max(255)
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.max': 'Email cannot exceed 255 characters'
      }),
    
    phone: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]{10,}$/)
      .allow('')
      .messages({
        'string.pattern.base': 'Please provide a valid phone number (at least 10 digits)'
      }),
    
    college_id: Joi.string()
      .uuid()
      .messages({
        'string.uuid': 'College ID must be a valid UUID'
      })
  }).min(1); // At least one field must be provided for update

  // Student ID parameter validation
  static studentIdSchema = Joi.object({
    id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.uuid': 'Student ID must be a valid UUID',
        'any.required': 'Student ID is required'
      })
  });

  // Validation functions
  static validateCreateStudent(data) {
    return this.createStudentSchema.validate(data, { abortEarly: false });
  }

  static validateUpdateStudent(data) {
    return this.updateStudentSchema.validate(data, { abortEarly: false });
  }

  static validateStudentId(params) {
    return this.studentIdSchema.validate(params, { abortEarly: false });
  }
}

// Export individual validators for easier usage
export const validateCreateStudent = StudentValidators.validateCreateStudent.bind(StudentValidators);
export const validateUpdateStudent = StudentValidators.validateUpdateStudent.bind(StudentValidators);
export const validateStudentId = StudentValidators.validateStudentId.bind(StudentValidators);

export default StudentValidators;
