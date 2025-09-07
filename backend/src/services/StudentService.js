// StudentService.js
// Purpose: Business logic for managing students.

import { supabase } from '../config/database.js';
import { Student } from '../models/Student.js';

export class StudentService {
  // Create a new student
  static async createStudent(studentData) {
    try {
      const student = Student.create(studentData);
      
      const { data, error } = await supabase
        .from('students')
        .insert([student.toJSON()])
        .select()
        .single();

      if (error) throw error;
      return new Student(data);
    } catch (error) {
      throw new Error(`Failed to create student: ${error.message}`);
    }
  }

  // Get all students with optional filtering
  static async getAllStudents(filters = {}) {
    try {
      let query = supabase.from('students').select('*');

      // Apply filters
      if (filters.college_id) {
        query = query.eq('college_id', filters.college_id);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;
      return data.map(student => new Student(student));
    } catch (error) {
      throw new Error(`Failed to fetch students: ${error.message}`);
    }
  }

  // Get student by ID
  static async getStudentById(studentId) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Student not found');

      return new Student(data);
    } catch (error) {
      throw new Error(`Failed to fetch student: ${error.message}`);
    }
  }

  // Get student by email
  static async getStudentByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data ? new Student(data) : null;
    } catch (error) {
      throw new Error(`Failed to fetch student by email: ${error.message}`);
    }
  }

  // Update student
  static async updateStudent(studentId, updateData) {
    try {
      // Validate email if being updated
      if (updateData.email && !Student.validateEmail(updateData.email)) {
        throw new Error('Invalid email format');
      }
      
      // Validate phone if being updated
      if (updateData.phone && !Student.validatePhone(updateData.phone)) {
        throw new Error('Invalid phone number format');
      }

      const { data, error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', studentId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Student not found');

      return new Student(data);
    } catch (error) {
      throw new Error(`Failed to update student: ${error.message}`);
    }
  }

  // Delete student
  static async deleteStudent(studentId) {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Failed to delete student: ${error.message}`);
    }
  }

  // Get students by college
  static async getStudentsByCollege(collegeId) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('college_id', collegeId)
        .order('name', { ascending: true });

      if (error) throw error;
      return data.map(student => new Student(student));
    } catch (error) {
      throw new Error(`Failed to fetch students by college: ${error.message}`);
    }
  }

  // Check if email exists
  static async emailExists(email, excludeStudentId = null) {
    try {
      let query = supabase
        .from('students')
        .select('id')
        .eq('email', email);

      if (excludeStudentId) {
        query = query.neq('id', excludeStudentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data.length > 0;
    } catch (error) {
      throw new Error(`Failed to check email existence: ${error.message}`);
    }
  }
}

export default StudentService;
