// authMiddleware.js
// Purpose: Authenticate requests (e.g., verify JWT tokens).

import jwt from 'jsonwebtoken';
import ResponseHelper from '../utils/responseHelper.js';

/**
 * Authentication middleware
 */
export class AuthMiddleware {
  /**
   * Verify JWT token middleware
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Next middleware function
   */
  static verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return ResponseHelper.unauthorized(res, 'Access token is required');
      }

      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;

      if (!token) {
        return ResponseHelper.unauthorized(res, 'Access token is required');
      }

      const secretKey = process.env.JWT_SECRET;
      if (!secretKey) {
        console.error('JWT_SECRET environment variable is not set');
        return ResponseHelper.error(res, 'Server configuration error', 500);
      }

      const decoded = jwt.verify(token, secretKey);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return ResponseHelper.unauthorized(res, 'Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        return ResponseHelper.unauthorized(res, 'Invalid token');
      } else {
        console.error('Auth middleware error:', error);
        return ResponseHelper.error(res, 'Authentication failed', 500);
      }
    }
  }

  /**
   * Optional authentication middleware (doesn't fail if no token)
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Next middleware function
   */
  static optionalAuth(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader) {
        const token = authHeader.startsWith('Bearer ') 
          ? authHeader.slice(7) 
          : authHeader;

        if (token) {
          const secretKey = process.env.JWT_SECRET;
          if (secretKey) {
            try {
              const decoded = jwt.verify(token, secretKey);
              req.user = decoded;
            } catch (error) {
              // Ignore token errors in optional auth
              req.user = null;
            }
          }
        }
      }

      next();
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      next();
    }
  }

  /**
   * Verify admin role middleware
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Next middleware function
   */
  static verifyAdmin(req, res, next) {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, 'Authentication required');
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return ResponseHelper.forbidden(res, 'Admin access required');
    }

    next();
  }

  /**
   * Verify super admin role middleware
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Next middleware function
   */
  static verifySuperAdmin(req, res, next) {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, 'Authentication required');
    }

    if (req.user.role !== 'super_admin') {
      return ResponseHelper.forbidden(res, 'Super admin access required');
    }

    next();
  }

  /**
   * Verify resource ownership (for students accessing their own data)
   * @param {string} userIdParam - Parameter name containing user ID
   * @returns {function} - Middleware function
   */
  static verifyOwnership(userIdParam = 'id') {
    return (req, res, next) => {
      if (!req.user) {
        return ResponseHelper.unauthorized(res, 'Authentication required');
      }

      const resourceUserId = req.params[userIdParam];
      const currentUserId = req.user.id || req.user.student_id;

      // Allow admins to access any resource
      if (req.user.role === 'admin' || req.user.role === 'super_admin') {
        return next();
      }

      // Check if user owns the resource
      if (resourceUserId !== currentUserId) {
        return ResponseHelper.forbidden(res, 'Access denied: You can only access your own resources');
      }

      next();
    };
  }

  /**
   * Generate JWT token
   * @param {object} payload - Token payload
   * @param {string} expiresIn - Token expiration (default: '24h')
   * @returns {string} - JWT token
   */
  static generateToken(payload, expiresIn = '24h') {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    return jwt.sign(payload, secretKey, { expiresIn });
  }

  /**
   * Generate refresh token
   * @param {object} payload - Token payload
   * @returns {string} - Refresh token
   */
  static generateRefreshToken(payload) {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }

    return jwt.sign(payload, refreshSecret, { expiresIn: '7d' });
  }

  /**
   * Verify refresh token
   * @param {string} token - Refresh token
   * @returns {object} - Decoded token payload
   */
  static verifyRefreshToken(token) {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }

    return jwt.verify(token, refreshSecret);
  }
}

// Export individual methods for easier usage
export const verifyToken = AuthMiddleware.verifyToken;
export const optionalAuth = AuthMiddleware.optionalAuth;
export const verifyAdmin = AuthMiddleware.verifyAdmin;
export const verifySuperAdmin = AuthMiddleware.verifySuperAdmin;
export const verifyOwnership = AuthMiddleware.verifyOwnership;
export const generateToken = AuthMiddleware.generateToken;
export const generateRefreshToken = AuthMiddleware.generateRefreshToken;
export const verifyRefreshToken = AuthMiddleware.verifyRefreshToken;

export default AuthMiddleware;
