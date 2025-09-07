// College.js
// Purpose: Define College model schema and export model factory/function.

/**
 * College model definition
 * Represents a college entity with validation and helper methods
 */
export class College {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.address = data.address;
    this.contact_email = data.contact_email;
    this.phone = data.phone;
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

  // Create a new college instance with validation
  static create(data) {
    if (!data.name || data.name.trim().length < 3) {
      throw new Error('College name must be at least 3 characters long');
    }
    if (!data.address || data.address.trim().length < 10) {
      throw new Error('College address must be at least 10 characters long');
    }
    if (!data.contact_email || !this.validateEmail(data.contact_email)) {
      throw new Error('Valid contact email is required');
    }
    if (data.phone && !this.validatePhone(data.phone)) {
      throw new Error('Invalid phone number format');
    }

    return new College(data);
  }

  // Convert to plain object for database operations
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      contact_email: this.contact_email,
      phone: this.phone,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default College;
