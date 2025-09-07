import { supabase } from '../config/database.js';

export async function listColleges(_req, res) {
	try {
		const { data, error } = await supabase.from('colleges').select('*').order('college_id', { ascending: true });
		if (error) return res.status(400).json({ error: error.message });
		res.json({ colleges: data });
	} catch { res.status(500).json({ error: 'Server error' }); }
}

export async function createCollege(req, res) {
	try {
		const { name, location } = req.body;
		if (!name) return res.status(400).json({ error: 'Missing name' });
		const { data, error } = await supabase.from('colleges').insert([{ name, location }]).select().single();
		if (error) return res.status(400).json({ error: error.message });
		res.json({ college: data });
	} catch { res.status(500).json({ error: 'Server error' }); }
}
