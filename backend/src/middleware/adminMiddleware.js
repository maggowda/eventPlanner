// adminMiddleware.js
// Purpose: Authorize admin-only routes.

import ResponseHelper from '../utils/responseHelper.js';

/**
 * Admin authorization middleware
 */
export class AdminMiddleware {
  /**
   * Require admin role
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Next middleware function
   */
  static requireAdmin(req, res, next) {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, 'Authentication required');
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return ResponseHelper.forbidden(res, 'Admin access required');
    }

    next();
  }

  /**
   * Require super admin role
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Next middleware function
   */
  static requireSuperAdmin(req, res, next) {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, 'Authentication required');
    }

    if (req.user.role !== 'super_admin') {
      return ResponseHelper.forbidden(res, 'Super admin access required');
    }

    next();
  }

  /**
   * Check if user has any admin role
   * @param {object} user - User object
   * @returns {boolean} - True if user is admin or super admin
   */
  static isAdmin(user) {
    return user && (user.role === 'admin' || user.role === 'super_admin');
  }

  /**
   * Check if user has super admin role
   * @param {object} user - User object
   * @returns {boolean} - True if user is super admin
   */
  static isSuperAdmin(user) {
    return user && user.role === 'super_admin';
  }

  /**
   * Allow admin or resource owner
   * @param {string} userIdParam - Parameter name containing user ID
   * @returns {function} - Middleware function
   */
  static allowAdminOrOwner(userIdParam = 'id') {
    return (req, res, next) => {
      if (!req.user) {
        return ResponseHelper.unauthorized(res, 'Authentication required');
      }

      // Allow if user is admin or super admin
      if (this.isAdmin(req.user)) {
        return next();
      }

      // Allow if user owns the resource
      const resourceUserId = req.params[userIdParam];
      const currentUserId = req.user.id || req.user.student_id;

      if (resourceUserId === currentUserId) {
        return next();
      }

      return ResponseHelper.forbidden(res, 'Access denied');
    };
  }

  /**
   * Allow admin or college member
   * @param {string} collegeIdParam - Parameter name containing college ID
   * @returns {function} - Middleware function
   */
  static allowAdminOrCollegeMember(collegeIdParam = 'college_id') {
    return (req, res, next) => {
      if (!req.user) {
        return ResponseHelper.unauthorized(res, 'Authentication required');
      }

      // Allow if user is admin or super admin
      if (this.isAdmin(req.user)) {
        return next();
      }

      // Allow if user belongs to the same college
      const resourceCollegeId = req.params[collegeIdParam] || req.body[collegeIdParam];
      const userCollegeId = req.user.college_id;

      if (resourceCollegeId === userCollegeId) {
        return next();
      }

      return ResponseHelper.forbidden(res, 'Access denied: College access required');
    };
  }

  /**
   * Check admin permissions for resource operations
   * @param {string} operation - Operation type (create, read, update, delete)
   * @param {string} resource - Resource type
   * @returns {function} - Middleware function
   */
  static checkPermissions(operation, resource) {
    return (req, res, next) => {
      if (!req.user) {
        return ResponseHelper.unauthorized(res, 'Authentication required');
      }

      const userRole = req.user.role;

      // Super admin has all permissions
      if (userRole === 'super_admin') {
        return next();
      }

      // Regular admin permissions
      if (userRole === 'admin') {
        // Define admin permissions here
        const adminPermissions = {
          events: ['create', 'read', 'update', 'delete'],
          students: ['create', 'read', 'update'],
          registrations: ['read', 'update'],
          attendance: ['read', 'update'],
          feedback: ['read'],
          reports: ['read'],
          colleges: ['read']
        };

        const allowedOperations = adminPermissions[resource] || [];
        
        if (allowedOperations.includes(operation)) {
          return next();
        }
      }

      return ResponseHelper.forbidden(res, `Insufficient permissions for ${operation} on ${resource}`);
    };
  }

  /**
   * Log admin actions for audit trail
   * @param {string} action - Action performed
   * @returns {function} - Middleware function
   */
  static logAdminAction(action) {
    return (req, res, next) => {
      if (req.user && this.isAdmin(req.user)) {
        const logData = {
          admin_id: req.user.id,
          admin_username: req.user.username,
          action: action,
          resource: req.originalUrl,
          method: req.method,
          ip: req.ip,
          user_agent: req.get('User-Agent'),
          timestamp: new Date().toISOString(),
          request_body: req.method !== 'GET' ? req.body : undefined
        };

        // Log to console (in production, this should go to a proper logging service)
        console.log('Admin Action:', JSON.stringify(logData, null, 2));

        // Attach log data to request for potential database logging
        req.adminAction = logData;
      }

      next();
    };
  }

  /**
   * Rate limiting for admin actions
   * @param {number} maxAttempts - Maximum attempts per window
   * @param {number} windowMs - Time window in milliseconds
   * @returns {function} - Middleware function
   */
  static rateLimit(maxAttempts = 100, windowMs = 15 * 60 * 1000) {
    const attempts = new Map();

    return (req, res, next) => {
      if (!req.user || !this.isAdmin(req.user)) {
        return next();
      }

      const key = `admin_${req.user.id}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean old entries
      const userAttempts = attempts.get(key) || [];
      const recentAttempts = userAttempts.filter(time => time > windowStart);

      if (recentAttempts.length >= maxAttempts) {
        return ResponseHelper.error(res, 'Too many admin actions. Please try again later.', 429);
      }

      // Record this attempt
      recentAttempts.push(now);
      attempts.set(key, recentAttempts);

      next();
    };
  }
}

// Export individual methods for easier usage
export const requireAdmin = AdminMiddleware.requireAdmin;
export const requireSuperAdmin = AdminMiddleware.requireSuperAdmin;
export const isAdmin = AdminMiddleware.isAdmin;
export const isSuperAdmin = AdminMiddleware.isSuperAdmin;
export const allowAdminOrOwner = AdminMiddleware.allowAdminOrOwner;
export const allowAdminOrCollegeMember = AdminMiddleware.allowAdminOrCollegeMember;
export const checkPermissions = AdminMiddleware.checkPermissions;
export const logAdminAction = AdminMiddleware.logAdminAction;
export const rateLimit = AdminMiddleware.rateLimit;

export default AdminMiddleware;
