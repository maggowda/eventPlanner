// Attendance.js
// Purpose: Define Attendance model schema and export model factory/function.

/**
 * Attendance model definition
 * Represents attendance record for a student at an event
 */
export class Attendance {
  constructor(data) {
    this.id = data.id;
    this.student_id = data.student_id;
    this.event_id = data.event_id;
    this.attended = data.attended || false;
    this.check_in_time = data.check_in_time;
    this.check_out_time = data.check_out_time;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new attendance instance with validation
  static create(data) {
    if (!data.student_id) {
      throw new Error('Student ID is required');
    }
    if (!data.event_id) {
      throw new Error('Event ID is required');
    }

    return new Attendance(data);
  }

  // Mark student as attended with check-in time
  markAttended(checkInTime = null) {
    this.attended = true;
    this.check_in_time = checkInTime || new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  // Mark student as checked out
  markCheckedOut(checkOutTime = null) {
    if (!this.attended) {
      throw new Error('Cannot check out student who has not checked in');
    }
    this.check_out_time = checkOutTime || new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  // Calculate duration if both check-in and check-out times exist
  getDuration() {
    if (!this.check_in_time || !this.check_out_time) {
      return null;
    }
    
    const checkIn = new Date(this.check_in_time);
    const checkOut = new Date(this.check_out_time);
    return Math.floor((checkOut - checkIn) / (1000 * 60)); // Duration in minutes
  }

  // Check if student is still checked in (attended but not checked out)
  isCheckedIn() {
    return this.attended && this.check_in_time && !this.check_out_time;
  }

  // Convert to plain object for database operations
  toJSON() {
    return {
      id: this.id,
      student_id: this.student_id,
      event_id: this.event_id,
      attended: this.attended,
      check_in_time: this.check_in_time,
      check_out_time: this.check_out_time,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default Attendance;
