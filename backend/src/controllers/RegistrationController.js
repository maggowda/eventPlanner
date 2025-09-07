import { supabase } from '../config/database.js';

export async function registerStudent(req, res) {
	try {
		const { event_id, student_id } = req.body;
		if (!event_id || !student_id) return res.status(400).json({ error: 'Missing event_id or student_id' });
		const { data, error } = await supabase
			.from('registrations')
			.insert([{ event_id, student_id }])
			.select()
			.single();
		if (error) return res.status(400).json({ error: error.message });
		res.json({ registration: data });
	} catch { res.status(500).json({ error: 'Server error' }); }
}
