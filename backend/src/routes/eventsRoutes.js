import express from 'express';
import { createEvent, listEvents } from '../controllers/EventController.js';
const router = express.Router();
router.post('/', createEvent);
router.get('/', listEvents);
export default router;
