# Event Planner Backend

Node.js + Express backend using Supabase (Postgres) as the database.

## Features
- Events management
- Students management
- Registrations
- Attendance tracking
- Feedback collection
- Reporting endpoints

## Tech Stack
- Express
- @supabase/supabase-js
- PostgreSQL (Supabase)
- dotenv, morgan, cors

## Setup
1. Clone repository
2. Create a `.env` file in `backend/` based on `.env.example`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3000
```
3. Install dependencies:
```
cd backend
npm install
```
4. Start server:
```
npm run dev
```
Server runs at `http://localhost:3000`.

## Database Schema (run in Supabase SQL editor)
```sql
CREATE TABLE colleges (
  college_id SERIAL PRIMARY KEY,
  name TEXT,
  location TEXT
);

CREATE TABLE students (
  student_id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  roll_number TEXT UNIQUE,
  phone_number TEXT,
  department TEXT,
  college_id INT REFERENCES colleges(college_id)
);

CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  college_id INT REFERENCES colleges(college_id),
  name TEXT,
  type TEXT,
  date DATE,
  time TIME,
  location TEXT,
  organizer TEXT,
  status TEXT CHECK (status IN ('Scheduled','Cancelled','Completed'))
);

CREATE TABLE registrations (
  registration_id SERIAL PRIMARY KEY,
  event_id INT REFERENCES events(event_id),
  student_id INT REFERENCES students(student_id),
  registration_date TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, student_id)
);

CREATE TABLE attendance (
  attendance_id SERIAL PRIMARY KEY,
  event_id INT REFERENCES events(event_id),
  student_id INT REFERENCES students(student_id),
  status TEXT CHECK (status IN ('Present','Absent')),
  UNIQUE(event_id, student_id)
);

CREATE TABLE feedback (
  feedback_id SERIAL PRIMARY KEY,
  event_id INT REFERENCES events(event_id),
  student_id INT REFERENCES students(student_id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  UNIQUE(event_id, student_id)
);
```

## Optional Helper SQL (RPC Functions)
For reporting endpoints that use RPC calls you can add these Postgres functions in Supabase. (Alternatively adjust the code to use SQL queries directly.)
```sql
-- Event popularity (event with registration counts)
CREATE OR REPLACE FUNCTION event_popularity()
RETURNS TABLE(event_id INT, name TEXT, registrations_count BIGINT) AS $$
  SELECT e.event_id, e.name, COUNT(r.registration_id) AS registrations_count
  FROM events e
  LEFT JOIN registrations r ON r.event_id = e.event_id
  GROUP BY e.event_id
  ORDER BY registrations_count DESC;
$$ LANGUAGE sql STABLE;

-- Student participation (events per student)
CREATE OR REPLACE FUNCTION student_participation()
RETURNS TABLE(student_id INT, student_name TEXT, events_registered BIGINT) AS $$
  SELECT s.student_id, s.name, COUNT(r.registration_id) AS events_registered
  FROM students s
  LEFT JOIN registrations r ON r.student_id = s.student_id
  GROUP BY s.student_id
  ORDER BY events_registered DESC;
$$ LANGUAGE sql STABLE;

-- Top active students (top 3)
CREATE OR REPLACE FUNCTION top_active_students()
RETURNS TABLE(student_id INT, student_name TEXT, registrations_count BIGINT) AS $$
  SELECT s.student_id, s.name, COUNT(r.registration_id) AS registrations_count
  FROM students s
  LEFT JOIN registrations r ON r.student_id = s.student_id
  GROUP BY s.student_id
  ORDER BY registrations_count DESC
  LIMIT 3;
$$ LANGUAGE sql STABLE;
```

## API Endpoints
### Events
- POST /events
- GET /events

### Students
- POST /students
- GET /students

### Registrations
- POST /register

### Attendance
- POST /attendance

### Feedback
- POST /feedback

### Reports
- GET /reports/event-popularity
- GET /reports/student-participation
- GET /reports/top-students
- GET /reports/filter?type=Workshop
- GET /reports/attendance/:event_id
- GET /reports/feedback/:event_id

## Notes
- All responses are JSON.
- Service role key should NEVER be exposed to frontend; this backend acts as a secure layer.
- Add validation / auth as needed.
