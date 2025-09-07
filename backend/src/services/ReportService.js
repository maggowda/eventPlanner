// ReportService.js
// Purpose: Business logic for generating reports (event popularity, participation, etc.).

import { supabase } from '../config/database.js';
import { EventService } from './EventService.js';
import { AttendanceService } from './AttendanceService.js';
import { FeedbackService } from './FeedbackService.js';
import { RegistrationService } from './RegistrationService.js';

export class ReportService {
  /**
   * Generate event summary report
   * @param {string} eventId - Event ID
   * @returns {object} - Event summary report
   */
  static async generateEventSummaryReport(eventId) {
    try {
      // Get event details
      const event = await EventService.getEventById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Get registrations
      const registrations = await RegistrationService.getEventRegistrations(eventId);
      
      // Get attendance summary
      const attendanceSummary = await AttendanceService.getEventAttendanceSummary(eventId);
      
      // Get feedback stats
      const feedbackStats = await FeedbackService.getEventFeedbackStats(eventId);

      const report = {
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          start_date: event.start_date,
          end_date: event.end_date,
          location: event.location,
          capacity: event.capacity,
          status: event.status
        },
        registration_summary: {
          total_registrations: registrations.length,
          confirmed: registrations.filter(r => r.status === 'confirmed').length,
          pending: registrations.filter(r => r.status === 'pending').length,
          cancelled: registrations.filter(r => r.status === 'cancelled').length,
          registration_rate: event.capacity > 0 ? 
            ((registrations.length / event.capacity) * 100).toFixed(2) : 0
        },
        attendance_summary: attendanceSummary,
        feedback_summary: feedbackStats,
        generated_at: new Date().toISOString()
      };

      return report;
    } catch (error) {
      throw new Error(`Failed to generate event summary report: ${error.message}`);
    }
  }

  /**
   * Generate attendance report for a date range
   * @param {object} options - Report options
   * @returns {object} - Attendance report
   */
  static async generateAttendanceReport(options = {}) {
    try {
      const { start_date, end_date, event_id, student_id } = options;

      let filters = {};
      if (start_date) filters.start_date = start_date;
      if (end_date) filters.end_date = end_date;
      if (event_id) filters.event_id = event_id;
      if (student_id) filters.student_id = student_id;

      // Get attendance records
      const attendanceRecords = await AttendanceService.getAttendanceRecords(filters);

      // Calculate statistics
      const stats = {
        total_records: attendanceRecords.length,
        present: attendanceRecords.filter(r => r.status === 'present').length,
        absent: attendanceRecords.filter(r => r.status === 'absent').length,
        late: attendanceRecords.filter(r => r.status === 'late').length,
        unique_students: [...new Set(attendanceRecords.map(r => r.student_id))].length,
        unique_events: [...new Set(attendanceRecords.map(r => r.event_id))].length
      };

      stats.attendance_rate = stats.total_records > 0 ? 
        (((stats.present + stats.late) / stats.total_records) * 100).toFixed(2) : 0;

      const report = {
        filters: filters,
        statistics: stats,
        records: attendanceRecords,
        generated_at: new Date().toISOString()
      };

      return report;
    } catch (error) {
      throw new Error(`Failed to generate attendance report: ${error.message}`);
    }
  }

  /**
   * Generate student performance report
   * @param {string} studentId - Student ID
   * @param {object} options - Report options
   * @returns {object} - Student performance report
   */
  static async generateStudentPerformanceReport(studentId, options = {}) {
    try {
      // Get student details
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;
      if (!student) throw new Error('Student not found');

      // Get student registrations
      const registrations = await RegistrationService.getStudentRegistrations(studentId);
      
      // Get student attendance stats
      const attendanceStats = await AttendanceService.getStudentAttendanceStats(studentId, options);
      
      // Get student feedback
      const feedback = await FeedbackService.getStudentFeedback(studentId);

      const report = {
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          college_id: student.college_id
        },
        registration_summary: {
          total_registrations: registrations.length,
          confirmed: registrations.filter(r => r.status === 'confirmed').length,
          pending: registrations.filter(r => r.status === 'pending').length,
          cancelled: registrations.filter(r => r.status === 'cancelled').length
        },
        attendance_summary: attendanceStats,
        feedback_summary: {
          total_feedback: feedback.length,
          average_rating: feedback.length > 0 ? 
            (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(2) : 0,
          latest_feedback: feedback.slice(0, 5) // Latest 5 feedback entries
        },
        generated_at: new Date().toISOString()
      };

      return report;
    } catch (error) {
      throw new Error(`Failed to generate student performance report: ${error.message}`);
    }
  }

  /**
   * Generate college-wise statistics report
   * @param {string} collegeId - College ID (optional)
   * @returns {object} - College statistics report
   */
  static async generateCollegeStatsReport(collegeId = null) {
    try {
      let query = supabase.from('students').select('college_id');
      
      if (collegeId) {
        query = query.eq('college_id', collegeId);
      }

      const { data: students, error } = await query;
      if (error) throw error;

      // Group students by college
      const collegeStats = {};
      students.forEach(student => {
        if (!collegeStats[student.college_id]) {
          collegeStats[student.college_id] = {
            total_students: 0,
            active_registrations: 0,
            total_attendance: 0,
            total_feedback: 0
          };
        }
        collegeStats[student.college_id].total_students++;
      });

      // Get additional stats for each college
      for (const cId of Object.keys(collegeStats)) {
        // Get college details
        const { data: college } = await supabase
          .from('colleges')
          .select('name')
          .eq('id', cId)
          .single();

        if (college) {
          collegeStats[cId].college_name = college.name;
        }

        // Get registrations count
        const { data: registrations } = await supabase
          .from('registrations')
          .select('id')
          .in('student_id', students.filter(s => s.college_id === cId).map(s => s.id));

        collegeStats[cId].active_registrations = registrations ? registrations.length : 0;

        // Get attendance count
        const { data: attendance } = await supabase
          .from('attendance')
          .select('id')
          .in('student_id', students.filter(s => s.college_id === cId).map(s => s.id));

        collegeStats[cId].total_attendance = attendance ? attendance.length : 0;

        // Get feedback count
        const { data: feedback } = await supabase
          .from('feedback')
          .select('id')
          .in('student_id', students.filter(s => s.college_id === cId).map(s => s.id));

        collegeStats[cId].total_feedback = feedback ? feedback.length : 0;
      }

      const report = {
        college_statistics: collegeStats,
        summary: {
          total_colleges: Object.keys(collegeStats).length,
          total_students: students.length,
          most_active_college: Object.entries(collegeStats)
            .sort((a, b) => b[1].active_registrations - a[1].active_registrations)[0]?.[0] || null
        },
        generated_at: new Date().toISOString()
      };

      return report;
    } catch (error) {
      throw new Error(`Failed to generate college stats report: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive dashboard report
   * @param {object} options - Report options
   * @returns {object} - Dashboard report
   */
  static async generateDashboardReport(options = {}) {
    try {
      const { date_range = 30 } = options; // Default to last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - date_range);

      // Get counts for various entities
      const { data: totalEvents } = await supabase.from('events').select('id', { count: 'exact' });
      const { data: totalStudents } = await supabase.from('students').select('id', { count: 'exact' });
      const { data: totalColleges } = await supabase.from('colleges').select('id', { count: 'exact' });
      
      // Get recent activity
      const { data: recentRegistrations } = await supabase
        .from('registrations')
        .select('*')
        .gte('registration_date', startDate.toISOString())
        .order('registration_date', { ascending: false })
        .limit(10);

      const { data: recentAttendance } = await supabase
        .from('attendance')
        .select('*')
        .gte('check_in_time', startDate.toISOString())
        .order('check_in_time', { ascending: false })
        .limit(10);

      // Get upcoming events
      const upcomingEvents = await EventService.getUpcomingEvents(5);

      // Get overall feedback stats
      const feedbackStats = await FeedbackService.getOverallFeedbackStats({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

      const report = {
        summary: {
          total_events: totalEvents?.length || 0,
          total_students: totalStudents?.length || 0,
          total_colleges: totalColleges?.length || 0,
          recent_registrations: recentRegistrations?.length || 0,
          recent_attendance: recentAttendance?.length || 0
        },
        upcoming_events: upcomingEvents,
        recent_activity: {
          registrations: recentRegistrations || [],
          attendance: recentAttendance || []
        },
        feedback_overview: feedbackStats,
        date_range: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          days: date_range
        },
        generated_at: new Date().toISOString()
      };

      return report;
    } catch (error) {
      throw new Error(`Failed to generate dashboard report: ${error.message}`);
    }
  }
}

export default ReportService;
