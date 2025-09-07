// AttendanceService.js
// Purpose: Business logic for recording and retrieving attendance.

import { supabase } from '../config/database.js';
import { Attendance } from '../models/Attendance.js';

export class AttendanceService {
  /**
   * Mark student attendance (check-in or check-out)
   * @param {object} attendanceData - Attendance data
   * @returns {Attendance} - Created attendance record
   */
  static async markAttendance(attendanceData) {
    try {
      const attendance = Attendance.create(attendanceData);
      
      // Check if already checked in today for this event
      if (attendanceData.status === 'present') {
        const existingAttendance = await this.getStudentEventAttendance(
          attendanceData.student_id, 
          attendanceData.event_id,
          new Date().toISOString().split('T')[0] // Today's date
        );
        
        if (existingAttendance.length > 0) {
          throw new Error('Student already checked in for this event today');
        }
      }

      const { data, error } = await supabase
        .from('attendance')
        .insert([attendance.toJSON()])
        .select()
        .single();

      if (error) throw error;
      return new Attendance(data);
    } catch (error) {
      throw new Error(`Failed to mark attendance: ${error.message}`);
    }
  }

  /**
   * Get attendance records with optional filtering
   * @param {object} filters - Filter options
   * @returns {array} - Array of attendance records
   */
  static async getAttendanceRecords(filters = {}) {
    try {
      let query = supabase.from('attendance').select('*');

      // Apply filters
      if (filters.student_id) {
        query = query.eq('student_id', filters.student_id);
      }
      if (filters.event_id) {
        query = query.eq('event_id', filters.event_id);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.date) {
        query = query.gte('check_in_time', `${filters.date}T00:00:00`)
               .lt('check_in_time', `${filters.date}T23:59:59`);
      }

      const { data, error } = await query.order('check_in_time', { ascending: false });

      if (error) throw error;
      return data.map(attendance => new Attendance(attendance));
    } catch (error) {
      throw new Error(`Failed to fetch attendance records: ${error.message}`);
    }
  }

  /**
   * Get attendance for a specific student and event
   * @param {string} studentId - Student ID
   * @param {string} eventId - Event ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {array} - Array of attendance records
   */
  static async getStudentEventAttendance(studentId, eventId, date = null) {
    try {
      let query = supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .eq('event_id', eventId);

      if (date) {
        query = query.gte('check_in_time', `${date}T00:00:00`)
                     .lt('check_in_time', `${date}T23:59:59`);
      }

      const { data, error } = await query.order('check_in_time', { ascending: false });

      if (error) throw error;
      return data.map(attendance => new Attendance(attendance));
    } catch (error) {
      throw new Error(`Failed to fetch student event attendance: ${error.message}`);
    }
  }

  /**
   * Get event attendance summary
   * @param {string} eventId - Event ID
   * @param {string} date - Date (YYYY-MM-DD)
   * @returns {object} - Attendance summary
   */
  static async getEventAttendanceSummary(eventId, date = null) {
    try {
      let query = supabase
        .from('attendance')
        .select('status')
        .eq('event_id', eventId);

      if (date) {
        query = query.gte('check_in_time', `${date}T00:00:00`)
                     .lt('check_in_time', `${date}T23:59:59`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const summary = {
        total: data.length,
        present: data.filter(record => record.status === 'present').length,
        absent: data.filter(record => record.status === 'absent').length,
        late: data.filter(record => record.status === 'late').length
      };

      summary.attendance_rate = summary.total > 0 ? 
        ((summary.present + summary.late) / summary.total * 100).toFixed(2) : 0;

      return summary;
    } catch (error) {
      throw new Error(`Failed to fetch event attendance summary: ${error.message}`);
    }
  }

  /**
   * Update attendance record
   * @param {string} attendanceId - Attendance ID
   * @param {object} updateData - Data to update
   * @returns {Attendance} - Updated attendance record
   */
  static async updateAttendance(attendanceId, updateData) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .update(updateData)
        .eq('id', attendanceId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Attendance record not found');

      return new Attendance(data);
    } catch (error) {
      throw new Error(`Failed to update attendance: ${error.message}`);
    }
  }

  /**
   * Check out student (if they checked in)
   * @param {string} studentId - Student ID
   * @param {string} eventId - Event ID
   * @returns {Attendance} - Updated attendance record
   */
  static async checkOutStudent(studentId, eventId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const attendanceRecords = await this.getStudentEventAttendance(studentId, eventId, today);
      
      if (attendanceRecords.length === 0) {
        throw new Error('No check-in record found for today');
      }

      const latestRecord = attendanceRecords[0];
      if (latestRecord.check_out_time) {
        throw new Error('Student already checked out');
      }

      const checkOutTime = new Date().toISOString();
      return await this.updateAttendance(latestRecord.id, { 
        check_out_time: checkOutTime 
      });
    } catch (error) {
      throw new Error(`Failed to check out student: ${error.message}`);
    }
  }

  /**
   * Get attendance statistics for a student
   * @param {string} studentId - Student ID
   * @param {object} options - Options (date range, event_id)
   * @returns {object} - Attendance statistics
   */
  static async getStudentAttendanceStats(studentId, options = {}) {
    try {
      let query = supabase
        .from('attendance')
        .select('status, event_id')
        .eq('student_id', studentId);

      if (options.start_date) {
        query = query.gte('check_in_time', options.start_date);
      }
      if (options.end_date) {
        query = query.lte('check_in_time', options.end_date);
      }
      if (options.event_id) {
        query = query.eq('event_id', options.event_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total_sessions: data.length,
        present: data.filter(record => record.status === 'present').length,
        absent: data.filter(record => record.status === 'absent').length,
        late: data.filter(record => record.status === 'late').length,
        events_attended: [...new Set(data.map(record => record.event_id))].length
      };

      stats.attendance_rate = stats.total_sessions > 0 ? 
        ((stats.present + stats.late) / stats.total_sessions * 100).toFixed(2) : 0;

      return stats;
    } catch (error) {
      throw new Error(`Failed to fetch student attendance stats: ${error.message}`);
    }
  }

  /**
   * Delete attendance record
   * @param {string} attendanceId - Attendance ID
   * @returns {boolean} - True if deleted successfully
   */
  static async deleteAttendance(attendanceId) {
    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', attendanceId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Failed to delete attendance record: ${error.message}`);
    }
  }

  /**
   * Bulk mark attendance for multiple students
   * @param {array} attendanceRecords - Array of attendance data
   * @returns {array} - Array of created attendance records
   */
  static async bulkMarkAttendance(attendanceRecords) {
    try {
      const validatedRecords = attendanceRecords.map(record => {
        const attendance = Attendance.create(record);
        return attendance.toJSON();
      });

      const { data, error } = await supabase
        .from('attendance')
        .insert(validatedRecords)
        .select();

      if (error) throw error;
      return data.map(attendance => new Attendance(attendance));
    } catch (error) {
      throw new Error(`Failed to bulk mark attendance: ${error.message}`);
    }
  }
}

export default AttendanceService;
