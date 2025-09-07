// Registration.js
// Purpose: Define Registration model schema and export model factory/function.

/**
 * Registration model definition
 * Represents a student's registration for an event
 */
export class Registration {
  constructor(data) {
    this.id = data.id;
    this.student_id = data.student_id;
    this.event_id = data.event_id;
    this.registration_date = data.registration_date;
    this.status = data.status || 'confirmed'; // confirmed, cancelled, waitlisted
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Valid status values
  static get VALID_STATUSES() {
    return ['confirmed', 'cancelled', 'waitlisted'];
  }

  // Validation helpers
  static validateStatus(status) {
    return this.VALID_STATUSES.includes(status);
  }

  // Create a new registration instance with validation
  static create(data) {
    if (!data.student_id) {
      throw new Error('Student ID is required');
    }
    if (!data.event_id) {
      throw new Error('Event ID is required');
    }
    if (data.status && !this.validateStatus(data.status)) {
      throw new Error(`Status must be one of: ${this.VALID_STATUSES.join(', ')}`);
    }

    return new Registration({
      ...data,
      registration_date: data.registration_date || new Date().toISOString()
    });
  }

  // Check if registration is active
  isActive() {
    return this.status === 'confirmed';
  }

  // Cancel registration
  cancel() {
    this.status = 'cancelled';
    this.updated_at = new Date().toISOString();
  }

  // Convert to plain object for database operations
  toJSON() {
    return {
      id: this.id,
      student_id: this.student_id,
      event_id: this.event_id,
      registration_date: this.registration_date,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default Registration;
