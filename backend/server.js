import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import './db.js';

import eventsRouter from './routes/events.js';
import studentsRouter from './routes/students.js';
import registrationsRouter from './routes/registrations.js';
import attendanceRouter from './routes/attendance.js';
import feedbackRouter from './routes/feedback.js';
import reportsRouter from './routes/reports.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({ message: 'Event Planner API' });
});

app.use('/events', eventsRouter);
app.use('/students', studentsRouter);
app.use('/register', registrationsRouter); // POST only
app.use('/attendance', attendanceRouter); // POST only
app.use('/feedback', feedbackRouter); // POST only
app.use('/reports', reportsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
