# Campus Event Planner

An event management system for colleges/universities, built with modern web technologies.

## Project Structure

```
eventPlanner/
├── backend/          # Node.js/Express.js API server
├── frontend/         # React.js web application
├── LICENSE          # Project license
└── README.md        # Project documentation
```

## Tech Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt
- **Development**: nodemon

### Frontend
- **Framework**: React.js with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router

## Features

### Core Functionality
- **Event Management**: Create, read, update, delete events
- **Student Management**: Register and manage student profiles
- **Event Registration**: Students can register for events
- **Attendance Tracking**: Mark attendance with QR codes
- **Reporting**: Generate attendance and event reports
- **Feedback System**: Collect event feedback and ratings

### Admin Features
- **Authentication**: Secure admin login/registration
- **Dashboard**: Analytics and insights
- **User Management**: Manage admins and students

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   PORT=3000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new admin |
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/logout` | Admin logout |
| GET | `/api/auth/profile` | Get admin profile |
| PUT | `/api/auth/profile` | Update admin profile |

### Event Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| POST | `/api/events` | Create new event |
| GET | `/api/events/:id` | Get event by ID |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |

### Student Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | Get all students |
| POST | `/api/students` | Add new student |
| GET | `/api/students/:id` | Get student by ID |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |

### Registration Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/registrations` | Register for event |
| GET | `/api/registrations` | Get all registrations |
| DELETE | `/api/registrations/:id` | Cancel registration |

## Output Screenshots

### Backend API Testing
![Backend API - Events](backend/Output/Screenshot%202025-09-07%20133501.png)


![Backend API - Database](backend/Output/Screenshot%202025-09-07%20133623.png)


![Backend API - Authentication](backend/Output/Screenshot%202025-09-07%20133853.png)


![Backend API - Response](backend/Output/Screenshot%202025-09-07%20133945.png)


### Frontend Application
![Frontend - Login](frontend/output/Screenshot%202025-09-07%20090135.png)


![Frontend - Dashboard](frontend/output/Screenshot%202025-09-07%20090157.png)


![Frontend - Events](frontend/output/Screenshot%202025-09-07%20090209.png)


![Frontend - Students](frontend/output/Screenshot%202025-09-07%20090219.png)


![Frontend - Registration](frontend/output/Screenshot%202025-09-07%20090231.png)


![Frontend - Reports](frontend/output/Screenshot%202025-09-07%20090246.png)


**Campus Event Planner** - Streamlining event management for educational institutions.