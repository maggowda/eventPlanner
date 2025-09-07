import express from 'express';
import { createStudent, listStudents } from '../controllers/StudentController.js';
const router = express.Router();
router.post('/', createStudent);
router.get('/', listStudents);
export default router;
