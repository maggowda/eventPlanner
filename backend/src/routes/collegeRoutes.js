import express from 'express';
import { listColleges, createCollege } from '../controllers/CollegeController.js';
const router = express.Router();
router.get('/', listColleges);
router.post('/', createCollege);
export default router;
