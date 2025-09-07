import { supabase } from '../config/database.js';

export async function eventPopularity(_req, res) {
	try {
		const { data, error } = await supabase.rpc('event_popularity');
		if (error) return res.status(400).json({ error: error.message });
		res.json({ events: data });
	} catch { res.status(500).json({ error: 'Server error' }); }
}

export async function studentParticipation(_req, res) {
	try {
		const { data, error } = await supabase.rpc('student_participation');
		if (error) return res.status(400).json({ error: error.message });
		res.json({ participation: data });
	} catch { res.status(500).json({ error: 'Server error' }); }
}

export async function topStudents(_req, res) {
	try {
		const { data, error } = await supabase.rpc('top_active_students');
		if (error) return res.status(400).json({ error: error.message });
		res.json({ top_students: data });
	} catch { res.status(500).json({ error: 'Server error' }); }
}

export async function filterEvents(req, res) {
	try {
		const { type } = req.query;
		let query = supabase.from('events').select('*');
		if (type) query = query.eq('type', type);
		const { data, error } = await query.order('date', { ascending: true }).order('time', { ascending: true });
		if (error) return res.status(400).json({ error: error.message });
		res.json({ events: data });
	} catch { res.status(500).json({ error: 'Server error' }); }
}

export async function attendancePercentage(req, res) {
	try {
		const { event_id } = req.params;
		const { count: totalCount, error: regErr } = await supabase
			.from('registrations')
			.select('*', { count: 'exact', head: true })
			.eq('event_id', event_id);
		if (regErr) return res.status(400).json({ error: regErr.message });

		const { count: presentCount, error: attErr } = await supabase
			.from('attendance')
			.select('*', { count: 'exact', head: true })
			.eq('event_id', event_id)
			.eq('status', 'Present');
		if (attErr) return res.status(400).json({ error: attErr.message });

		const percentage = totalCount === 0 ? 0 : (presentCount / totalCount) * 100;
		res.json({ event_id, total_registrations: totalCount, present: presentCount, attendance_percentage: Number(percentage.toFixed(2)) });
	} catch { res.status(500).json({ error: 'Server error' }); }
}

export async function feedbackAverage(req, res) {
	try {
		const { event_id } = req.params;
		const { data, error } = await supabase.from('feedback').select('rating').eq('event_id', event_id);
		if (error) return res.status(400).json({ error: error.message });
		const ratings = data.map(r => r.rating);
		const average = ratings.length ? ratings.reduce((a,b)=>a+b,0)/ratings.length : 0;
		res.json({ event_id, average_rating: Number(average.toFixed(2)), count: ratings.length });
	} catch { res.status(500).json({ error: 'Server error' }); }
}
