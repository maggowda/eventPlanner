// index.js
// Purpose: Aggregate and register all route modules with the Express app.

import express from 'express';
import authRoutes from './authRoutes.js';
import eventsRoutes from './eventsRoutes.js';
import studentsRoutes from './studentsRoutes.js';
import collegeRoutes from './collegeRoutes.js';
import registrationsRoutes from './registrationsRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import reportsRoutes from './reportsRoutes.js';

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Event Planner API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Register all route modules
router.use('/auth', authRoutes);
router.use('/events', eventsRoutes);
router.use('/students', studentsRoutes);
router.use('/colleges', collegeRoutes);
router.use('/registrations', registrationsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/reports', reportsRoutes);

export default router;
