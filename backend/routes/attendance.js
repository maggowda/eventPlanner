import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

// Mark attendance
router.post('/', async (req, res) => {
  try {
    const { event_id, student_id, status } = req.body;
    if (!event_id || !student_id || !status) {
      return res.status(400).json({ error: 'Missing event_id, student_id or status' });
    }
    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const { data, error } = await supabase
      .from('attendance')
      .insert([{ event_id, student_id, status }])
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ attendance: data });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
