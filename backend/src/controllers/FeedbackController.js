import { supabase } from '../config/database.js';

export async function submitFeedback(req, res) {
	try {
		const { event_id, student_id, rating, comments } = req.body;
		if (!event_id || !student_id || rating == null) return res.status(400).json({ error: 'Missing event_id, student_id or rating' });
		if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });
		const { data, error } = await supabase
			.from('feedback')
			.insert([{ event_id, student_id, rating, comments }])
			.select()
			.single();
		if (error) return res.status(400).json({ error: error.message });
		res.json({ feedback: data });
	} catch { res.status(500).json({ error: 'Server error' }); }
}
