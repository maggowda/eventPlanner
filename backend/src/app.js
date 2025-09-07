import { testConnection } from './config/database.js';
import express from 'express';
import { corsMiddleware } from './middleware/corsMiddleware.js';
import { loggingMiddleware } from './middleware/loggingMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import eventsRouter from './routes/eventsRoutes.js';
import studentsRouter from './routes/studentsRoutes.js';
import registrationRouter from './routes/registrationsRoutes.js';
import attendanceRouter from './routes/attendanceRoutes.js';
import feedbackRouter from './routes/feedbackRoutes.js';
import reportRouter from './routes/reportsRoutes.js';
import collegeRouter from './routes/collegeRoutes.js';
import authRouter from './routes/authRoutes.js';

const app = express();
app.use(corsMiddleware);
app.use(express.json());
app.use(loggingMiddleware);

// Health check endpoint
app.get('/', (_req, res) => res.json({ 
  message: 'Campus Event API', 
  version: '1.0.0',
  status: 'running'
}));

// Health check endpoint
app.get('/health', (_req, res) => res.json({ 
  status: 'healthy',
  timestamp: new Date().toISOString()
}));

// API routes with /api prefix
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/registrations', registrationRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/reports', reportRouter);
app.use('/api/colleges', collegeRouter);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

// Test database connection on startup
testConnection().catch(console.error);

export default app;