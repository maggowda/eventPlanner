// authRoutes.js
// Purpose: Define authentication-related routes; delegate to AuthController.

import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { verifyToken, verifySuperAdmin } from '../middleware/authMiddleware.js';
import { general, auth } from '../middleware/rateLimitMiddleware.js';
import { patterns } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', auth, AuthController.register);
router.post('/login', auth, AuthController.login);
router.post('/forgot-password', auth, AuthController.forgotPassword);

// Protected routes (authentication required)
router.use(verifyToken); // Apply authentication to all routes below

// Profile management
router.get('/profile', general, AuthController.getProfile);
router.put('/profile', general, AuthController.updateProfile);
router.post('/change-password', auth, AuthController.changePassword);

// Session management
router.get('/validate', general, AuthController.validateSession);
router.post('/logout', general, AuthController.logout);

// Super admin only routes
router.get('/admins', verifySuperAdmin, general, AuthController.getAllAdmins);
router.post('/admins/:id/deactivate', 
  verifySuperAdmin, 
  patterns.uuid('id'), 
  auth, 
  AuthController.deactivateAdmin
);
router.post('/admins/:id/activate', 
  verifySuperAdmin, 
  patterns.uuid('id'), 
  auth, 
  AuthController.activateAdmin
);

export default router;
