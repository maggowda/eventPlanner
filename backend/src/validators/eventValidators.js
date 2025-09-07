// eventValidators.js
// Purpose: Validation schemas for event-related requests.

import Joi from 'joi';

/**
 * Event validation schemas
 */
export class EventValidators {
  // Create event validation schema
  static createEventSchema = Joi.object({
    title: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.min': 'Event title must be at least 3 characters long',
        'string.max': 'Event title cannot exceed 100 characters',
        'any.required': 'Event title is required'
      }),
    
    description: Joi.string()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Event description must be at least 10 characters long',
        'string.max': 'Event description cannot exceed 1000 characters',
        'any.required': 'Event description is required'
      }),
    
    date: Joi.date()
      .iso()
      .min('now')
      .required()
      .messages({
        'date.min': 'Event date must be in the future',
        'any.required': 'Event date is required'
      }),
    
    location: Joi.string()
      .min(3)
      .max(200)
      .required()
      .messages({
        'string.min': 'Event location must be at least 3 characters long',
        'string.max': 'Event location cannot exceed 200 characters',
        'any.required': 'Event location is required'
      }),
    
    max_attendees: Joi.number()
      .integer()
      .positive()
      .max(10000)
      .required()
      .messages({
        'number.positive': 'Maximum attendees must be a positive number',
        'number.max': 'Maximum attendees cannot exceed 10,000',
        'any.required': 'Maximum attendees is required'
      }),
    
    college_id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.uuid': 'College ID must be a valid UUID',
        'any.required': 'College ID is required'
      })
  });

  // Update event validation schema
  static updateEventSchema = Joi.object({
    title: Joi.string()
      .min(3)
      .max(100)
      .messages({
        'string.min': 'Event title must be at least 3 characters long',
        'string.max': 'Event title cannot exceed 100 characters'
      }),
    
    description: Joi.string()
      .min(10)
      .max(1000)
      .messages({
        'string.min': 'Event description must be at least 10 characters long',
        'string.max': 'Event description cannot exceed 1000 characters'
      }),
    
    date: Joi.date()
      .iso()
      .min('now')
      .messages({
        'date.min': 'Event date must be in the future'
      }),
    
    location: Joi.string()
      .min(3)
      .max(200)
      .messages({
        'string.min': 'Event location must be at least 3 characters long',
        'string.max': 'Event location cannot exceed 200 characters'
      }),
    
    max_attendees: Joi.number()
      .integer()
      .positive()
      .max(10000)
      .messages({
        'number.positive': 'Maximum attendees must be a positive number',
        'number.max': 'Maximum attendees cannot exceed 10,000'
      }),
    
    college_id: Joi.string()
      .uuid()
      .messages({
        'string.uuid': 'College ID must be a valid UUID'
      })
  }).min(1); // At least one field must be provided for update

  // Event ID parameter validation
  static eventIdSchema = Joi.object({
    id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.uuid': 'Event ID must be a valid UUID',
        'any.required': 'Event ID is required'
      })
  });

  // Validation functions
  static validateCreateEvent(data) {
    return this.createEventSchema.validate(data, { abortEarly: false });
  }

  static validateUpdateEvent(data) {
    return this.updateEventSchema.validate(data, { abortEarly: false });
  }

  static validateEventId(params) {
    return this.eventIdSchema.validate(params, { abortEarly: false });
  }
}

// Export individual validators for easier usage
export const validateCreateEvent = EventValidators.validateCreateEvent.bind(EventValidators);
export const validateUpdateEvent = EventValidators.validateUpdateEvent.bind(EventValidators);
export const validateEventId = EventValidators.validateEventId.bind(EventValidators);

export default EventValidators;
