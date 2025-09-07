// Admin.js
// Purpose: Define Admin model schema (for authentication / authorization) and export model factory/function.

/**
 * Admin model definition
 * Represents an admin user with authentication capabilities
 */
export class Admin {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.role = data.role || 'admin'; // admin, super_admin
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.last_login = data.last_login;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Valid roles
  static get VALID_ROLES() {
    return ['admin', 'super_admin'];
  }

  // Validation helpers
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateUsername(username) {
    // Username must be 3-20 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  static validateRole(role) {
    return this.VALID_ROLES.includes(role);
  }

  // Create a new admin instance with validation
  static create(data) {
    if (!data.username || !this.validateUsername(data.username)) {
      throw new Error('Username must be 3-20 characters long and contain only letters, numbers, and underscores');
    }
    if (!data.email || !this.validateEmail(data.email)) {
      throw new Error('Valid email is required');
    }
    if (!data.password_hash) {
      throw new Error('Password hash is required');
    }
    if (data.role && !this.validateRole(data.role)) {
      throw new Error(`Role must be one of: ${this.VALID_ROLES.join(', ')}`);
    }

    return new Admin(data);
  }

  // Check if admin is super admin
  isSuperAdmin() {
    return this.role === 'super_admin';
  }

  // Update last login time
  updateLastLogin() {
    this.last_login = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  // Deactivate admin account
  deactivate() {
    this.is_active = false;
    this.updated_at = new Date().toISOString();
  }

  // Activate admin account
  activate() {
    this.is_active = true;
    this.updated_at = new Date().toISOString();
  }

  // Convert to plain object for database operations (excluding password_hash for security)
  toJSON(includePassword = false) {
    const result = {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      is_active: this.is_active,
      last_login: this.last_login,
      created_at: this.created_at,
      updated_at: this.updated_at
    };

    if (includePassword) {
      result.password_hash = this.password_hash;
    }

    return result;
  }
}

export default Admin;
