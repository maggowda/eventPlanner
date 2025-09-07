// Student.js
// Purpose: Define Student model schema and export model factory/function.

/**
 * Student model definition
 * Represents a student entity with validation and helper methods
 */
export class Student {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.phone = data.phone;
    this.college_id = data.college_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Validation helpers
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  // Create a new student instance with validation
  static create(data) {
    if (!data.email || !this.validateEmail(data.email)) {
      throw new Error('Valid email is required');
    }
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    if (data.phone && !this.validatePhone(data.phone)) {
      throw new Error('Invalid phone number format');
    }
    if (!data.college_id) {
      throw new Error('College ID is required');
    }

    return new Student(data);
  }

  // Convert to plain object for database operations
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      phone: this.phone,
      college_id: this.college_id,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default Student;
