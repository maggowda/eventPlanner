import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

// Create event
router.post('/', async (req, res) => {
  try {
    const { college_id, name, type, date, time, location, organizer, status = 'Scheduled' } = req.body;
    if (!college_id || !name || !type || !date || !time || !location || !organizer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const { data, error } = await supabase
      .from('events')
      .insert([{ college_id, name, type, date, time, location, organizer, status }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ event: data });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// List events
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ events: data });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
