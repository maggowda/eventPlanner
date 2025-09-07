// attendanceValidators.js
// Purpose: Validation schemas for attendance endpoints.

import Joi from 'joi';

// Mark attendance validation
export const markAttendanceValidator = Joi.object({
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
    .valid('present', 'absent', 'late')
    .required()
    .messages({
      'any.only': 'Status must be one of: present, absent, late',
      'any.required': 'Attendance status is required'
    }),
  
  check_in_time: Joi.date()
    .default(() => new Date())
    .messages({
      'date.base': 'Check-in time must be a valid date'
    }),
  
  check_out_time: Joi.date()
    .min(Joi.ref('check_in_time'))
    .messages({
      'date.base': 'Check-out time must be a valid date',
      'date.min': 'Check-out time must be after check-in time'
    }),
  
  notes: Joi.string()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    }),
  
  marked_by: Joi.string()
    .valid('self', 'admin', 'system')
    .default('admin')
    .messages({
      'any.only': 'Marked by must be one of: self, admin, system'
    }),
  
  location: Joi.string()
    .max(200)
    .messages({
      'string.max': 'Location cannot exceed 200 characters'
    }),
  
  device_info: Joi.object({
    device_type: Joi.string().max(50),
    browser: Joi.string().max(50),
    ip_address: Joi.string().ip()
  }).messages({
    'object.base': 'Device info must be an object'
  })
});

// Update attendance validation
export const updateAttendanceValidator = Joi.object({
  status: Joi.string()
    .valid('present', 'absent', 'late')
    .messages({
      'any.only': 'Status must be one of: present, absent, late'
    }),
  
  check_in_time: Joi.date()
    .messages({
      'date.base': 'Check-in time must be a valid date'
    }),
  
  check_out_time: Joi.date()
    .min(Joi.ref('check_in_time'))
    .messages({
      'date.base': 'Check-out time must be a valid date',
      'date.min': 'Check-out time must be after check-in time'
    }),
  
  notes: Joi.string()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    }),
  
  location: Joi.string()
    .max(200)
    .messages({
      'string.max': 'Location cannot exceed 200 characters'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get attendance query validation
export const getAttendanceValidator = Joi.object({
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
    .valid('present', 'absent', 'late')
    .messages({
      'any.only': 'Status must be one of: present, absent, late'
    }),
  
  date: Joi.date()
    .messages({
      'date.base': 'Date must be a valid date'
    }),
  
  start_date: Joi.date()
    .messages({
      'date.base': 'Start date must be a valid date'
    }),
  
  end_date: Joi.date()
    .min(Joi.ref('start_date'))
    .messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date'
    }),
  
  marked_by: Joi.string()
    .valid('self', 'admin', 'system')
    .messages({
      'any.only': 'Marked by must be one of: self, admin, system'
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
    }),
  
  sort_by: Joi.string()
    .valid('check_in_time', 'check_out_time', 'student_name', 'event_title', 'status')
    .default('check_in_time')
    .messages({
      'any.only': 'Sort by must be one of: check_in_time, check_out_time, student_name, event_title, status'
    }),
  
  sort_order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Attendance ID parameter validation
export const attendanceIdValidator = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Attendance ID must be a valid UUID',
      'any.required': 'Attendance ID is required'
    })
});

// Check out validation
export const checkOutValidator = Joi.object({
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
  
  check_out_time: Joi.date()
    .default(() => new Date())
    .messages({
      'date.base': 'Check-out time must be a valid date'
    }),
  
  notes: Joi.string()
    .max(500)
    .allow('')
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
});

// Bulk attendance validation
export const bulkAttendanceValidator = Joi.object({
  event_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Event ID must be a valid UUID',
      'any.required': 'Event ID is required'
    }),
  
  attendance_records: Joi.array()
    .items(
      Joi.object({
        student_id: Joi.string()
          .uuid()
          .required()
          .messages({
            'string.uuid': 'Student ID must be a valid UUID',
            'any.required': 'Student ID is required'
          }),
        
        status: Joi.string()
          .valid('present', 'absent', 'late')
          .required()
          .messages({
            'any.only': 'Status must be one of: present, absent, late',
            'any.required': 'Attendance status is required'
          }),
        
        check_in_time: Joi.date()
          .messages({
            'date.base': 'Check-in time must be a valid date'
          }),
        
        notes: Joi.string()
          .max(500)
          .allow('')
          .messages({
            'string.max': 'Notes cannot exceed 500 characters'
          })
      })
    )
    .min(1)
    .max(100)
    .required()
    .messages({
      'array.min': 'At least one attendance record is required',
      'array.max': 'Cannot mark attendance for more than 100 students at once',
      'any.required': 'Attendance records array is required'
    }),
  
  marked_by: Joi.string()
    .valid('admin', 'system')
    .default('admin')
    .messages({
      'any.only': 'Marked by must be either admin or system'
    })
});

// Attendance statistics validation
export const attendanceStatsValidator = Joi.object({
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
  
  start_date: Joi.date()
    .messages({
      'date.base': 'Start date must be a valid date'
    }),
  
  end_date: Joi.date()
    .min(Joi.ref('start_date'))
    .messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date'
    }),
  
  group_by: Joi.string()
    .valid('event', 'student', 'date', 'month', 'week')
    .default('event')
    .messages({
      'any.only': 'Group by must be one of: event, student, date, month, week'
    })
});

// Attendance export validation
export const exportAttendanceValidator = Joi.object({
  event_id: Joi.string()
    .uuid()
    .messages({
      'string.uuid': 'Event ID must be a valid UUID'
    }),
  
  start_date: Joi.date()
    .messages({
      'date.base': 'Start date must be a valid date'
    }),
  
  end_date: Joi.date()
    .min(Joi.ref('start_date'))
    .messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date'
    }),
  
  status: Joi.array()
    .items(
      Joi.string().valid('present', 'absent', 'late')
    )
    .messages({
      'array.base': 'Status must be an array'
    }),
  
  format: Joi.string()
    .valid('csv', 'excel', 'pdf')
    .default('csv')
    .messages({
      'any.only': 'Format must be one of: csv, excel, pdf'
    }),
  
  include_details: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Include details must be a boolean value'
    })
});

// QR code attendance validation
export const qrAttendanceValidator = Joi.object({
  qr_code: Joi.string()
    .required()
    .messages({
      'any.required': 'QR code is required'
    }),
  
  student_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Student ID must be a valid UUID',
      'any.required': 'Student ID is required'
    }),
  
  location: Joi.object({
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .messages({
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90'
      }),
    
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .messages({
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180'
      })
  }).messages({
    'object.base': 'Location must be an object with latitude and longitude'
  })
});

export default {
  markAttendanceValidator,
  updateAttendanceValidator,
  getAttendanceValidator,
  attendanceIdValidator,
  checkOutValidator,
  bulkAttendanceValidator,
  attendanceStatsValidator,
  exportAttendanceValidator,
  qrAttendanceValidator
};
