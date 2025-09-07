// registrationValidators.js
// Purpose: Validation schemas for registration requests.

import Joi from 'joi';

// Create registration validation
export const createRegistrationValidator = Joi.object({
  student_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Student ID must be a valid UUID',
      'any.required': 'Student ID is required'
    }),
  
  event_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Event ID must be a valid UUID',
      'any.required': 'Event ID is required'
    }),
  
  status: Joi.string()
    .valid('pending', 'confirmed', 'cancelled')
    .default('pending')
    .messages({
      'any.only': 'Status must be one of: pending, confirmed, cancelled'
    }),
  
  notes: Joi.string()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    }),
  
  special_requirements: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Special requirements cannot exceed 1000 characters'
    })
});

// Update registration validation
export const updateRegistrationValidator = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'cancelled')
    .messages({
      'any.only': 'Status must be one of: pending, confirmed, cancelled'
    }),
  
  notes: Joi.string()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    }),
  
  special_requirements: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Special requirements cannot exceed 1000 characters'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get registrations query validation
export const getRegistrationsValidator = Joi.object({
  student_id: Joi.string()
    .uuid()
    .messages({
      'string.uuid': 'Student ID must be a valid UUID'
    }),
  
  event_id: Joi.string()
    .uuid()
    .messages({
      'string.uuid': 'Event ID must be a valid UUID'
    }),
  
  status: Joi.string()
    .valid('pending', 'confirmed', 'cancelled')
    .messages({
      'any.only': 'Status must be one of: pending, confirmed, cancelled'
    }),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
});

// Registration ID parameter validation
export const registrationIdValidator = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Registration ID must be a valid UUID',
      'any.required': 'Registration ID is required'
    })
});

// Cancel registration validation
export const cancelRegistrationValidator = Joi.object({
  reason: Joi.string()
    .max(500)
    .messages({
      'string.max': 'Cancellation reason cannot exceed 500 characters'
    })
});

// Bulk registration validation
export const bulkRegistrationValidator = Joi.object({
  event_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Event ID must be a valid UUID',
      'any.required': 'Event ID is required'
    }),
  
  student_ids: Joi.array()
    .items(
      Joi.string()
        .uuid()
        .messages({
          'string.uuid': 'Each student ID must be a valid UUID'
        })
    )
    .min(1)
    .max(100)
    .required()
    .messages({
      'array.min': 'At least one student ID is required',
      'array.max': 'Cannot register more than 100 students at once',
      'any.required': 'Student IDs array is required'
    }),
  
  status: Joi.string()
    .valid('pending', 'confirmed')
    .default('pending')
    .messages({
      'any.only': 'Status must be either pending or confirmed'
    })
});

export default {
  createRegistrationValidator,
  updateRegistrationValidator,
  getRegistrationsValidator,
  registrationIdValidator,
  cancelRegistrationValidator,
  bulkRegistrationValidator
};
