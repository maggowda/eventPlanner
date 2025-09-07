// Feedback.js
// Purpose: Define Feedback model schema and export model factory/function.

/**
 * Feedback model definition
 * Represents feedback given by a student for an event
 */
export class Feedback {
  constructor(data) {
    this.id = data.id;
    this.student_id = data.student_id;
    this.event_id = data.event_id;
    this.rating = data.rating;
    this.comments = data.comments;
    this.submitted_at = data.submitted_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Valid rating range
  static get MIN_RATING() { return 1; }
  static get MAX_RATING() { return 5; }

  // Validation helpers
  static validateRating(rating) {
    return Number.isInteger(rating) && 
           rating >= this.MIN_RATING && 
           rating <= this.MAX_RATING;
  }

  // Create a new feedback instance with validation
  static create(data) {
    if (!data.student_id) {
      throw new Error('Student ID is required');
    }
    if (!data.event_id) {
      throw new Error('Event ID is required');
    }
    if (!data.rating || !this.validateRating(data.rating)) {
      throw new Error(`Rating must be an integer between ${this.MIN_RATING} and ${this.MAX_RATING}`);
    }
    if (data.comments && typeof data.comments !== 'string') {
      throw new Error('Comments must be a string');
    }

    return new Feedback({
      ...data,
      submitted_at: data.submitted_at || new Date().toISOString()
    });
  }

  // Check if feedback is positive (rating >= 4)
  isPositive() {
    return this.rating >= 4;
  }

  // Check if feedback is negative (rating <= 2)
  isNegative() {
    return this.rating <= 2;
  }

  // Get rating as stars string
  getStars() {
    return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
  }

  // Convert to plain object for database operations
  toJSON() {
    return {
      id: this.id,
      student_id: this.student_id,
      event_id: this.event_id,
      rating: this.rating,
      comments: this.comments,
      submitted_at: this.submitted_at,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default Feedback;
