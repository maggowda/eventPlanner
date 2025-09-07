import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

// Add student
router.post('/', async (req, res) => {
  try {
    const { name, email, roll_number, phone_number, department, college_id } = req.body;
    if (!name || !email || !roll_number || !college_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const { data, error } = await supabase
      .from('students')
      .insert([{ name, email, roll_number, phone_number, department, college_id }])
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ student: data });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// List students
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('student_id', { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ students: data });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
