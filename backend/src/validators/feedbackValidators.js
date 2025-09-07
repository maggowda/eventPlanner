// feedbackValidators.js
// Purpose: Validation schemas for feedback submissions.

import Joi from 'joi';

// Create feedback validation
export const createFeedbackValidator = Joi.object({
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
  
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.integer': 'Rating must be an integer',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required'
    }),
  
  comments: Joi.string()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'Comments cannot exceed 2000 characters'
    }),
  
  category: Joi.string()
    .valid('overall', 'content', 'organization', 'venue', 'speaker', 'logistics')
    .default('overall')
    .messages({
      'any.only': 'Category must be one of: overall, content, organization, venue, speaker, logistics'
    }),
  
  is_anonymous: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Anonymous flag must be a boolean value'
    }),
  
  suggestions: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Suggestions cannot exceed 1000 characters'
    })
});

// Update feedback validation
export const updateFeedbackValidator = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .messages({
      'number.integer': 'Rating must be an integer',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5'
    }),
  
  comments: Joi.string()
    .max(2000)
    .allow('')
    .messages({
      'string.max': 'Comments cannot exceed 2000 characters'
    }),
  
  category: Joi.string()
    .valid('overall', 'content', 'organization', 'venue', 'speaker', 'logistics')
    .messages({
      'any.only': 'Category must be one of: overall, content, organization, venue, speaker, logistics'
    }),
  
  is_anonymous: Joi.boolean()
    .messages({
      'boolean.base': 'Anonymous flag must be a boolean value'
    }),
  
  suggestions: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Suggestions cannot exceed 1000 characters'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get feedback query validation
export const getFeedbackValidator = Joi.object({
  event_id: Joi.string()
    .uuid()
    .messages({
      'string.uuid': 'Event ID must be a valid UUID'
    }),
  
  student_id: Joi.string()
    .uuid()
    .messages({
      'string.uuid': 'Student ID must be a valid UUID'
    }),
  
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .messages({
      'number.integer': 'Rating must be an integer',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5'
    }),
  
  min_rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .messages({
      'number.integer': 'Minimum rating must be an integer',
      'number.min': 'Minimum rating must be at least 1',
      'number.max': 'Minimum rating cannot exceed 5'
    }),
  
  max_rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .messages({
      'number.integer': 'Maximum rating must be an integer',
      'number.min': 'Maximum rating must be at least 1',
      'number.max': 'Maximum rating cannot exceed 5'
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

// Feedback ID parameter validation
export const feedbackIdValidator = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Feedback ID must be a valid UUID',
      'any.required': 'Feedback ID is required'
    })
});

export default {
  createFeedbackValidator,
  updateFeedbackValidator,
  getFeedbackValidator,
  feedbackIdValidator
};
