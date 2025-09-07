import express from 'express';
import { createEvent, listEvents } from '../controllers/EventController.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', listEvents);
router.post('/', createEvent);

export default router;
