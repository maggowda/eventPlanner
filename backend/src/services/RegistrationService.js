// RegistrationService.js
// Purpose: Business logic for event registrations.

import { supabase } from '../config/database.js';
import { Registration } from '../models/Registration.js';

export class RegistrationService {
  /**
   * Register a student for an event
   * @param {object} registrationData - Registration data
   * @returns {Registration} - Created registration
   */
  static async registerStudentForEvent(registrationData) {
    try {
      const registration = Registration.create(registrationData);
      
      const { data, error } = await supabase
        .from('registrations')
        .insert([registration.toJSON()])
        .select()
        .single();

      if (error) throw error;
      return new Registration(data);
    } catch (error) {
      throw new Error(`Failed to register student for event: ${error.message}`);
    }
  }

  /**
   * Get all registrations with optional filtering
   * @param {object} filters - Filter options
   * @returns {array} - Array of registrations
   */
  static async getAllRegistrations(filters = {}) {
    try {
      let query = supabase.from('registrations').select('*');

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

      const { data, error } = await query.order('registration_date', { ascending: false });

      if (error) throw error;
      return data.map(registration => new Registration(registration));
    } catch (error) {
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }
  }

  /**
   * Get registration by ID
   * @param {string} registrationId - Registration ID
   * @returns {Registration|null} - Registration instance or null
   */
  static async getRegistrationById(registrationId) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', registrationId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Registration not found');

      return new Registration(data);
    } catch (error) {
      throw new Error(`Failed to fetch registration: ${error.message}`);
    }
  }

  /**
   * Cancel a registration
   * @param {string} registrationId - Registration ID
   * @returns {Registration} - Updated registration
   */
  static async cancelRegistration(registrationId) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .update({ status: 'cancelled' })
        .eq('id', registrationId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Registration not found');

      return new Registration(data);
    } catch (error) {
      throw new Error(`Failed to cancel registration: ${error.message}`);
    }
  }

  /**
   * Check if student is registered for event
   * @param {string} studentId - Student ID
   * @param {string} eventId - Event ID
   * @returns {boolean} - True if registered
   */
  static async isStudentRegistered(studentId, eventId) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('id')
        .eq('student_id', studentId)
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      if (error) throw error;
      return data.length > 0;
    } catch (error) {
      throw new Error(`Failed to check registration status: ${error.message}`);
    }
  }

  /**
   * Get registrations for an event
   * @param {string} eventId - Event ID
   * @returns {array} - Array of registrations with student details
   */
  static async getEventRegistrations(eventId) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          students (*)
        `)
        .eq('event_id', eventId)
        .order('registration_date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch event registrations: ${error.message}`);
    }
  }

  /**
   * Get registrations for a student
   * @param {string} studentId - Student ID
   * @returns {array} - Array of registrations with event details
   */
  static async getStudentRegistrations(studentId) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          events (*)
        `)
        .eq('student_id', studentId)
        .order('registration_date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch student registrations: ${error.message}`);
    }
  }

  /**
   * Update registration status
   * @param {string} registrationId - Registration ID
   * @param {string} status - New status
   * @returns {Registration} - Updated registration
   */
  static async updateRegistrationStatus(registrationId, status) {
    try {
      if (!Registration.VALID_STATUSES.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const { data, error } = await supabase
        .from('registrations')
        .update({ status })
        .eq('id', registrationId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Registration not found');

      return new Registration(data);
    } catch (error) {
      throw new Error(`Failed to update registration status: ${error.message}`);
    }
  }

  /**
   * Delete a registration
   * @param {string} registrationId - Registration ID
   * @returns {boolean} - True if deleted successfully
   */
  static async deleteRegistration(registrationId) {
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', registrationId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Failed to delete registration: ${error.message}`);
    }
  }
}

export default RegistrationService;
