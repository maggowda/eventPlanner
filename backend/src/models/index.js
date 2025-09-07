// index.js
// Purpose: Aggregate and export model definitions; setup associations between models.

import Student from './Student.js';
import Event from './Event.js';
import College from './College.js';
import Registration from './Registration.js';
import Attendance from './Attendance.js';
import Feedback from './Feedback.js';
import Admin from './Admin.js';

// Export all models
export {
  Student,
  Event,
  College,
  Registration,
  Attendance,
  Feedback,
  Admin
};

// Model relationships and associations
export const ModelRelations = {
  // Student belongs to College
  studentBelongsToCollege: (student, college) => {
    return student.college_id === college.id;
  },

  // Event belongs to College
  eventBelongsToCollege: (event, college) => {
    return event.college_id === college.id;
  },

  // Registration links Student and Event
  registrationLinksStudentEvent: (registration, student, event) => {
    return registration.student_id === student.id && registration.event_id === event.id;
  },

  // Attendance links Student and Event
  attendanceLinksStudentEvent: (attendance, student, event) => {
    return attendance.student_id === student.id && attendance.event_id === event.id;
  },

  // Feedback links Student and Event
  feedbackLinksStudentEvent: (feedback, student, event) => {
    return feedback.student_id === student.id && feedback.event_id === event.id;
  },

  // Helper to get all students for a college
  getStudentsForCollege: (students, collegeId) => {
    return students.filter(student => student.college_id === collegeId);
  },

  // Helper to get all events for a college
  getEventsForCollege: (events, collegeId) => {
    return events.filter(event => event.college_id === collegeId);
  },

  // Helper to get all registrations for a student
  getRegistrationsForStudent: (registrations, studentId) => {
    return registrations.filter(reg => reg.student_id === studentId);
  },

  // Helper to get all registrations for an event
  getRegistrationsForEvent: (registrations, eventId) => {
    return registrations.filter(reg => reg.event_id === eventId);
  }
};

// Default export with all models and relations
export default {
  Student,
  Event,
  College,
  Registration,
  Attendance,
  Feedback,
  Admin,
  ModelRelations
};
