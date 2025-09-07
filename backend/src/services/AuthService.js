// AuthService.js
// Purpose: Handle authentication (login, password hashing, token issuing, etc.).

import { supabase } from '../config/database.js';
import { Admin } from '../models/Admin.js';
import CryptoHelper from '../utils/cryptoHelper.js';
import { generateToken, generateRefreshToken } from '../middleware/authMiddleware.js';

export class AuthService {
  /**
   * Register a new admin
   * @param {object} adminData - Admin registration data
   * @returns {object} - Created admin and tokens
   */
  static async registerAdmin(adminData) {
    try {
      const { username, email, password, role = 'admin' } = adminData;

      // Check if admin already exists
      const existingAdmin = await this.getAdminByEmail(email);
      if (existingAdmin) {
        throw new Error('Admin with this email already exists');
      }

      const existingUsername = await this.getAdminByUsername(username);
      if (existingUsername) {
        throw new Error('Admin with this username already exists');
      }

      // Hash password
      const passwordHash = await CryptoHelper.hashPassword(password);

      // Create admin
      const admin = Admin.create({
        username,
        email,
        password_hash: passwordHash,
        role
      });

      const { data, error } = await supabase
        .from('admins')
        .insert([admin.toJSON(true)]) // Include password hash
        .select()
        .single();

      if (error) throw error;

      const createdAdmin = new Admin(data);
      
      // Generate tokens
      const tokenPayload = {
        id: createdAdmin.id,
        username: createdAdmin.username,
        email: createdAdmin.email,
        role: createdAdmin.role
      };

      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      return {
        admin: createdAdmin.toJSON(), // Exclude password hash
        accessToken,
        refreshToken
      };
    } catch (error) {
      throw new Error(`Failed to register admin: ${error.message}`);
    }
  }

  /**
   * Login admin
   * @param {string} identifier - Email or username
   * @param {string} password - Plain text password
   * @returns {object} - Admin and tokens
   */
  static async loginAdmin(identifier, password) {
    try {
      // Find admin by email or username
      let admin = await this.getAdminByEmail(identifier);
      if (!admin) {
        admin = await this.getAdminByUsername(identifier);
      }

      if (!admin) {
        throw new Error('Invalid credentials');
      }

      if (!admin.is_active) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isValidPassword = await CryptoHelper.comparePassword(password, admin.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await this.updateLastLogin(admin.id);
      admin.updateLastLogin();

      // Generate tokens
      const tokenPayload = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      };

      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      return {
        admin: admin.toJSON(), // Exclude password hash
        accessToken,
        refreshToken
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Get admin by email
   * @param {string} email - Admin email
   * @returns {Admin|null} - Admin instance or null
   */
  static async getAdminByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data ? new Admin(data) : null;
    } catch (error) {
      throw new Error(`Failed to get admin by email: ${error.message}`);
    }
  }

  /**
   * Get admin by username
   * @param {string} username - Admin username
   * @returns {Admin|null} - Admin instance or null
   */
  static async getAdminByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? new Admin(data) : null;
    } catch (error) {
      throw new Error(`Failed to get admin by username: ${error.message}`);
    }
  }

  /**
   * Get admin by ID
   * @param {string} adminId - Admin ID
   * @returns {Admin|null} - Admin instance or null
   */
  static async getAdminById(adminId) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', adminId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? new Admin(data) : null;
    } catch (error) {
      throw new Error(`Failed to get admin by ID: ${error.message}`);
    }
  }

  /**
   * Update admin last login time
   * @param {string} adminId - Admin ID
   */
  static async updateLastLogin(adminId) {
    try {
      const { error } = await supabase
        .from('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update last login:', error);
    }
  }

  /**
   * Change admin password
   * @param {string} adminId - Admin ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  static async changePassword(adminId, currentPassword, newPassword) {
    try {
      const admin = await this.getAdminById(adminId);
      if (!admin) {
        throw new Error('Admin not found');
      }

      // Verify current password
      const isValidPassword = await CryptoHelper.comparePassword(currentPassword, admin.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await CryptoHelper.hashPassword(newPassword);

      // Update password
      const { error } = await supabase
        .from('admins')
        .update({ password_hash: newPasswordHash })
        .eq('id', adminId);

      if (error) throw error;

      return true;
    } catch (error) {
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }

  /**
   * Reset admin password (for forgotten passwords)
   * @param {string} email - Admin email
   * @returns {string} - Reset token
   */
  static async requestPasswordReset(email) {
    try {
      const admin = await this.getAdminByEmail(email);
      if (!admin) {
        // Return success even if admin doesn't exist (security)
        return { success: true, message: 'If an account exists, a reset email will be sent' };
      }

      // Generate reset token
      const resetToken = CryptoHelper.generateSecureToken(32);
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token (in production, you'd store this in database)
      // For now, we'll just log it
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset token expires at: ${resetExpiry}`);

      // In production, send email with reset link
      // await EmailHelper.sendPasswordResetEmail({
      //   email: admin.email,
      //   name: admin.username,
      //   resetToken,
      //   resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      // });

      return { success: true, message: 'Password reset instructions sent to email' };
    } catch (error) {
      throw new Error(`Failed to request password reset: ${error.message}`);
    }
  }

  /**
   * Validate admin session
   * @param {string} adminId - Admin ID
   * @returns {Admin|null} - Admin instance or null
   */
  static async validateSession(adminId) {
    try {
      const admin = await this.getAdminById(adminId);
      
      if (!admin || !admin.is_active) {
        return null;
      }

      return admin;
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  /**
   * Deactivate admin account
   * @param {string} adminId - Admin ID
   */
  static async deactivateAdmin(adminId) {
    try {
      const { error } = await supabase
        .from('admins')
        .update({ is_active: false })
        .eq('id', adminId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Failed to deactivate admin: ${error.message}`);
    }
  }

  /**
   * Activate admin account
   * @param {string} adminId - Admin ID
   */
  static async activateAdmin(adminId) {
    try {
      const { error } = await supabase
        .from('admins')
        .update({ is_active: true })
        .eq('id', adminId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Failed to activate admin: ${error.message}`);
    }
  }

  /**
   * Get all admins (super admin only)
   * @returns {array} - Array of admins
   */
  static async getAllAdmins() {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(admin => new Admin(admin).toJSON());
    } catch (error) {
      throw new Error(`Failed to get all admins: ${error.message}`);
    }
  }

  /**
   * Update admin profile
   * @param {string} adminId - Admin ID
   * @param {object} updateData - Data to update
   */
  static async updateAdminProfile(adminId, updateData) {
    try {
      const allowedFields = ['username', 'email'];
      const filteredData = {};

      // Only allow certain fields to be updated
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      if (Object.keys(filteredData).length === 0) {
        throw new Error('No valid fields to update');
      }

      // Check for duplicate email/username
      if (filteredData.email) {
        const existingAdmin = await this.getAdminByEmail(filteredData.email);
        if (existingAdmin && existingAdmin.id !== adminId) {
          throw new Error('Email already in use');
        }
      }

      if (filteredData.username) {
        const existingAdmin = await this.getAdminByUsername(filteredData.username);
        if (existingAdmin && existingAdmin.id !== adminId) {
          throw new Error('Username already in use');
        }
      }

      const { data, error } = await supabase
        .from('admins')
        .update(filteredData)
        .eq('id', adminId)
        .select()
        .single();

      if (error) throw error;
      return new Admin(data).toJSON();
    } catch (error) {
      throw new Error(`Failed to update admin profile: ${error.message}`);
    }
  }
}

export default AuthService;
