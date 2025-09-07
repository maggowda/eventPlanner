// rateLimitMiddleware.js
// Purpose: Apply rate limiting to incoming requests.

import ResponseHelper from '../utils/responseHelper.js';

/**
 * Rate limiting middleware
 */
export class RateLimitMiddleware {
  /**
   * In-memory store for rate limiting (use Redis in production)
   */
  static store = new Map();

  /**
   * Clean expired entries from store
   */
  static cleanExpiredEntries() {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (data.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Create a rate limiter
   * @param {object} options - Rate limiting options
   * @returns {function} - Express middleware function
   */
  static createLimiter(options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutes
      max = 100, // Maximum requests per window
      message = 'Too many requests, please try again later',
      keyGenerator = (req) => req.ip,
      skipSuccessfulRequests = false,
      skipFailedRequests = false,
      standardHeaders = true,
      legacyHeaders = false
    } = options;

    return (req, res, next) => {
      const key = keyGenerator(req);
      const now = Date.now();
      
      // Clean expired entries periodically
      if (Math.random() < 0.01) { // 1% chance
        this.cleanExpiredEntries();
      }

      let record = this.store.get(key);
      
      if (!record || record.resetTime <= now) {
        record = {
          count: 0,
          resetTime: now + windowMs
        };
      }

      record.count++;
      this.store.set(key, record);

      const remaining = Math.max(0, max - record.count);
      const resetTime = new Date(record.resetTime);

      // Set standard headers
      if (standardHeaders) {
        res.set({
          'RateLimit-Limit': max,
          'RateLimit-Remaining': remaining,
          'RateLimit-Reset': resetTime.toISOString()
        });
      }

      // Set legacy headers
      if (legacyHeaders) {
        res.set({
          'X-RateLimit-Limit': max,
          'X-RateLimit-Remaining': remaining,
          'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000)
        });
      }

      if (record.count > max) {
        return ResponseHelper.error(res, message, 429, {
          limit: max,
          remaining: 0,
          resetTime: resetTime.toISOString()
        });
      }

      // Skip counting successful/failed requests if configured
      res.on('finish', () => {
        const shouldSkip = 
          (skipSuccessfulRequests && res.statusCode < 400) ||
          (skipFailedRequests && res.statusCode >= 400);

        if (shouldSkip) {
          record.count--;
          this.store.set(key, record);
        }
      });

      next();
    };
  }

  /**
   * General API rate limiter
   */
  static general = this.createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'Too many API requests, please try again later'
  });

  /**
   * Strict rate limiter for sensitive operations
   */
  static strict = this.createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    message: 'Too many requests for this operation, please try again later'
  });

  /**
   * Auth rate limiter for login/register
   */
  static auth = this.createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later',
    keyGenerator: (req) => `auth_${req.ip}`,
    skipSuccessfulRequests: true // Don't count successful logins
  });

  /**
   * Registration rate limiter
   */
  static registration = this.createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour per IP
    message: 'Too many registrations from this IP, please try again later',
    keyGenerator: (req) => `reg_${req.ip}`
  });

  /**
   * Password reset rate limiter
   */
  static passwordReset = this.createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset attempts per hour
    message: 'Too many password reset attempts, please try again later',
    keyGenerator: (req) => `pwd_reset_${req.ip}`
  });

  /**
   * Event creation rate limiter
   */
  static eventCreation = this.createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 events per hour
    message: 'Too many events created, please try again later',
    keyGenerator: (req) => `event_create_${req.user?.id || req.ip}`
  });

  /**
   * Feedback submission rate limiter
   */
  static feedback = this.createLimiter({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10, // 10 feedback submissions per day
    message: 'Too many feedback submissions today, please try again tomorrow',
    keyGenerator: (req) => `feedback_${req.user?.id || req.ip}`
  });

  /**
   * Report generation rate limiter
   */
  static reports = this.createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 report requests per hour
    message: 'Too many report requests, please try again later',
    keyGenerator: (req) => `reports_${req.user?.id || req.ip}`
  });

  /**
   * Create a user-specific rate limiter
   * @param {object} options - Rate limiting options
   * @returns {function} - Express middleware function
   */
  static createUserLimiter(options = {}) {
    return this.createLimiter({
      ...options,
      keyGenerator: (req) => `user_${req.user?.id || req.ip}`
    });
  }

  /**
   * Create an IP-based rate limiter
   * @param {object} options - Rate limiting options
   * @returns {function} - Express middleware function
   */
  static createIPLimiter(options = {}) {
    return this.createLimiter({
      ...options,
      keyGenerator: (req) => `ip_${req.ip}`
    });
  }

  /**
   * Create a path-specific rate limiter
   * @param {string} path - Path identifier
   * @param {object} options - Rate limiting options
   * @returns {function} - Express middleware function
   */
  static createPathLimiter(path, options = {}) {
    return this.createLimiter({
      ...options,
      keyGenerator: (req) => `path_${path}_${req.user?.id || req.ip}`
    });
  }

  /**
   * Get current rate limit status for a key
   * @param {string} key - Rate limit key
   * @returns {object|null} - Rate limit status or null if not found
   */
  static getStatus(key) {
    const record = this.store.get(key);
    if (!record) return null;

    const now = Date.now();
    if (record.resetTime <= now) {
      this.store.delete(key);
      return null;
    }

    return {
      count: record.count,
      resetTime: new Date(record.resetTime).toISOString(),
      remaining: Math.max(0, record.resetTime - now)
    };
  }

  /**
   * Reset rate limit for a key
   * @param {string} key - Rate limit key
   */
  static reset(key) {
    this.store.delete(key);
  }

  /**
   * Clear all rate limit data
   */
  static clear() {
    this.store.clear();
  }
}

// Export pre-configured limiters
export const general = RateLimitMiddleware.general;
export const strict = RateLimitMiddleware.strict;
export const auth = RateLimitMiddleware.auth;
export const registration = RateLimitMiddleware.registration;
export const passwordReset = RateLimitMiddleware.passwordReset;
export const eventCreation = RateLimitMiddleware.eventCreation;
export const feedback = RateLimitMiddleware.feedback;
export const reports = RateLimitMiddleware.reports;

export default RateLimitMiddleware;
