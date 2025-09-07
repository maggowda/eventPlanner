// Event.js
// Purpose: Define Event model schema and export model factory/function.

/**
 * Event model definition
 * Represents an event entity with validation and helper methods
 */
export class Event {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.date = data.date;
    this.location = data.location;
    this.max_attendees = data.max_attendees;
    this.college_id = data.college_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validation helpers
  static validateDate(date) {
    const eventDate = new Date(date);
    const now = new Date();
    return eventDate > now; // Event must be in the future
  }

  static validateMaxAttendees(maxAttendees) {
    return Number.isInteger(maxAttendees) && maxAttendees > 0;
  }

  // Create a new event instance with validation
  static create(data) {
    if (!data.title || data.title.trim().length < 3) {
      throw new Error('Event title must be at least 3 characters long');
    }
    if (!data.description || data.description.trim().length < 10) {
      throw new Error('Event description must be at least 10 characters long');
    }
    if (!data.date || !this.validateDate(data.date)) {
      throw new Error('Event date must be in the future');
    }
    if (!data.location || data.location.trim().length < 3) {
      throw new Error('Event location must be at least 3 characters long');
    }
    if (!data.max_attendees || !this.validateMaxAttendees(data.max_attendees)) {
      throw new Error('Max attendees must be a positive integer');
    }
    if (!data.college_id) {
      throw new Error('College ID is required');
    }

    return new Event(data);
  }

  // Check if event is in the past
  isPast() {
    return new Date(this.date) < new Date();
  }

  // Check if event is full
  isFull(currentAttendees = 0) {
    return currentAttendees >= this.max_attendees;
  }

  // Convert to plain object for database operations
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      date: this.date,
      location: this.location,
      max_attendees: this.max_attendees,
      college_id: this.college_id,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default Event;
