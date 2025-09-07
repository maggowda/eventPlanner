// AuthController.js
// Purpose: Express handlers for authentication routes, calling AuthService.

import AuthService from '../services/AuthService.js';
import ResponseHelper from '../utils/responseHelper.js';

export class AuthController {
  /**
   * Register a new admin
   * POST /api/auth/register
   */
  static async register(req, res) {
    try {
      const { username, email, password, role } = req.body;

      // Basic validation
      if (!username || !email || !password) {
        return ResponseHelper.validationError(res, 'Username, email, and password are required');
      }

      if (password.length < 6) {
        return ResponseHelper.validationError(res, 'Password must be at least 6 characters long');
      }

      const result = await AuthService.registerAdmin({
        username,
        email,
        password,
        role
      });

      return ResponseHelper.created(res, result, 'Admin registered successfully');
    } catch (error) {
      console.error('Register error:', error);
      return ResponseHelper.error(res, error.message, 400);
    }
  }

  /**
   * Login admin
   * POST /api/auth/login
   */
  static async login(req, res) {
    try {
      const { identifier, password } = req.body;

      // Basic validation
      if (!identifier || !password) {
        return ResponseHelper.validationError(res, 'Email/username and password are required');
      }

      const result = await AuthService.loginAdmin(identifier, password);

      return ResponseHelper.success(res, result, 'Login successful');
    } catch (error) {
      console.error('Login error:', error);
      return ResponseHelper.unauthorized(res, error.message);
    }
  }

  /**
   * Get current admin profile
   * GET /api/auth/profile
   */
  static async getProfile(req, res) {
    try {
      const adminId = req.user.id;
      const admin = await AuthService.getAdminById(adminId);

      if (!admin) {
        return ResponseHelper.notFound(res, 'Admin not found');
      }

      return ResponseHelper.success(res, admin.toJSON(), 'Profile retrieved successfully');
    } catch (error) {
      console.error('Get profile error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  /**
   * Update admin profile
   * PUT /api/auth/profile
   */
  static async updateProfile(req, res) {
    try {
      const adminId = req.user.id;
      const updateData = req.body;

      const updatedAdmin = await AuthService.updateAdminProfile(adminId, updateData);

      return ResponseHelper.success(res, updatedAdmin, 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      return ResponseHelper.error(res, error.message, 400);
    }
  }

  /**
   * Change admin password
   * POST /api/auth/change-password
   */
  static async changePassword(req, res) {
    try {
      const adminId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Basic validation
      if (!currentPassword || !newPassword) {
        return ResponseHelper.validationError(res, 'Current password and new password are required');
      }

      if (newPassword.length < 6) {
        return ResponseHelper.validationError(res, 'New password must be at least 6 characters long');
      }

      await AuthService.changePassword(adminId, currentPassword, newPassword);

      return ResponseHelper.success(res, null, 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      return ResponseHelper.error(res, error.message, 400);
    }
  }

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return ResponseHelper.validationError(res, 'Email is required');
      }

      const result = await AuthService.requestPasswordReset(email);

      return ResponseHelper.success(res, result, 'Password reset instructions sent');
    } catch (error) {
      console.error('Forgot password error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  /**
   * Validate current session
   * GET /api/auth/validate
   */
  static async validateSession(req, res) {
    try {
      const adminId = req.user.id;
      const admin = await AuthService.validateSession(adminId);

      if (!admin) {
        return ResponseHelper.unauthorized(res, 'Invalid session');
      }

      return ResponseHelper.success(res, admin.toJSON(), 'Session is valid');
    } catch (error) {
      console.error('Validate session error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  /**
   * Logout (client-side token removal, optionally blacklist token)
   * POST /api/auth/logout
   */
  static async logout(req, res) {
    try {
      // In a more sophisticated implementation, you might:
      // - Add the token to a blacklist
      // - Store logout time in database
      // - Clear refresh tokens
      
      return ResponseHelper.success(res, null, 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  /**
   * Get all admins (Super admin only)
   * GET /api/auth/admins
   */
  static async getAllAdmins(req, res) {
    try {
      // Check if user is super admin
      if (req.user.role !== 'super_admin') {
        return ResponseHelper.forbidden(res, 'Super admin access required');
      }

      const admins = await AuthService.getAllAdmins();

      return ResponseHelper.success(res, admins, 'Admins retrieved successfully');
    } catch (error) {
      console.error('Get all admins error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  /**
   * Deactivate admin (Super admin only)
   * POST /api/auth/admins/:id/deactivate
   */
  static async deactivateAdmin(req, res) {
    try {
      // Check if user is super admin
      if (req.user.role !== 'super_admin') {
        return ResponseHelper.forbidden(res, 'Super admin access required');
      }

      const { id } = req.params;

      // Prevent self-deactivation
      if (id === req.user.id) {
        return ResponseHelper.error(res, 'Cannot deactivate your own account', 400);
      }

      await AuthService.deactivateAdmin(id);

      return ResponseHelper.success(res, null, 'Admin deactivated successfully');
    } catch (error) {
      console.error('Deactivate admin error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }

  /**
   * Activate admin (Super admin only)
   * POST /api/auth/admins/:id/activate
   */
  static async activateAdmin(req, res) {
    try {
      // Check if user is super admin
      if (req.user.role !== 'super_admin') {
        return ResponseHelper.forbidden(res, 'Super admin access required');
      }

      const { id } = req.params;

      await AuthService.activateAdmin(id);

      return ResponseHelper.success(res, null, 'Admin activated successfully');
    } catch (error) {
      console.error('Activate admin error:', error);
      return ResponseHelper.error(res, error.message);
    }
  }
}

export default AuthController;
