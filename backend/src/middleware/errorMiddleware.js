export function errorHandler(err, _req, res, _next) {
	const status = err.status || 500;
	const message = err.message || 'Internal server error';
	if (status >= 500) console.error('[ERROR]', err);
	res.status(status).json({ error: message });
}
