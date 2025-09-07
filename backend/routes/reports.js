import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

// Event popularity - events sorted by registrations count
router.get('/event-popularity', async (_req, res) => {
  try {
    const { data, error } = await supabase.rpc('event_popularity');
    if (error) return res.status(400).json({ error: error.message });
    res.json({ events: data });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Student participation - events attended by each student
router.get('/student-participation', async (_req, res) => {
  try {
    const { data, error } = await supabase.rpc('student_participation');
    if (error) return res.status(400).json({ error: error.message });
    res.json({ participation: data });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Top 3 most active students (by registrations)
router.get('/top-students', async (_req, res) => {
  try {
    const { data, error } = await supabase.rpc('top_active_students');
    if (error) return res.status(400).json({ error: error.message });
    res.json({ top_students: data });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Filter events by type
router.get('/filter', async (req, res) => {
  try {
    const { type } = req.query;
    const query = supabase.from('events').select('*');
    if (type) query.eq('type', type);
    const { data, error } = await query.order('date', { ascending: true }).order('time', { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ events: data });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Attendance percentage for an event
router.get('/attendance/:event_id', async (req, res) => {
  try {
    const { event_id } = req.params;
    const { data: totalRegs, error: regErr } = await supabase
      .from('registrations')
      .select('registration_id', { count: 'exact', head: true })
      .eq('event_id', event_id);
    if (regErr) return res.status(400).json({ error: regErr.message });

    const { data: presentRows, error: attErr } = await supabase
      .from('attendance')
      .select('attendance_id', { count: 'exact', head: true })
      .eq('event_id', event_id)
      .eq('status', 'Present');
    if (attErr) return res.status(400).json({ error: attErr.message });

    const total = totalRegs?.length === 0 ? 0 : totalRegs;
    const present = presentRows?.length === 0 ? 0 : presentRows;
    // supabase-js v2 when using head:true doesn't return rows, count is in error? Actually count should be on response.count; adjusting
    const totalCount = totalRegs?.length ? totalRegs.length : totalRegs?.count ?? totalRegs?.[0]?.count ?? regErr?.count ?? 0;
    const presentCount = presentRows?.length ? presentRows.length : presentRows?.count ?? presentRows?.[0]?.count ?? attErr?.count ?? 0;
    const percentage = totalCount === 0 ? 0 : (presentCount / totalCount) * 100;
    res.json({ event_id, total_registrations: totalCount, present: presentCount, attendance_percentage: Number(percentage.toFixed(2)) });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Average feedback score for an event
router.get('/feedback/:event_id', async (req, res) => {
  try {
    const { event_id } = req.params;
    const { data, error } = await supabase
      .from('feedback')
      .select('rating')
      .eq('event_id', event_id);
    if (error) return res.status(400).json({ error: error.message });
    const ratings = data.map(r => r.rating);
    const average = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    res.json({ event_id, average_rating: Number(average.toFixed(2)), count: ratings.length });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
