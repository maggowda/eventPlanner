// FeedbackService.js
// Purpose: Business logic for submitting and analyzing feedback.

import { supabase } from '../config/database.js';
import { Feedback } from '../models/Feedback.js';

export class FeedbackService {
  /**
   * Create new feedback
   * @param {object} feedbackData - Feedback data
   * @returns {Feedback} - Created feedback instance
   */
  static async createFeedback(feedbackData) {
    try {
      const feedback = Feedback.create(feedbackData);
      
      const { data, error } = await supabase
        .from('feedback')
        .insert([feedback.toJSON()])
        .select()
        .single();

      if (error) throw error;
      return new Feedback(data);
    } catch (error) {
      throw new Error(`Failed to create feedback: ${error.message}`);
    }
  }

  /**
   * Get all feedback with optional filtering
   * @param {object} filters - Filter options
   * @returns {array} - Array of feedback instances
   */
  static async getAllFeedback(filters = {}) {
    try {
      let query = supabase.from('feedback').select('*');

      // Apply filters
      if (filters.event_id) {
        query = query.eq('event_id', filters.event_id);
      }
      if (filters.student_id) {
        query = query.eq('student_id', filters.student_id);
      }
      if (filters.rating) {
        query = query.eq('rating', filters.rating);
      }
      if (filters.min_rating) {
        query = query.gte('rating', filters.min_rating);
      }
      if (filters.max_rating) {
        query = query.lte('rating', filters.max_rating);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(feedback => new Feedback(feedback));
    } catch (error) {
      throw new Error(`Failed to fetch feedback: ${error.message}`);
    }
  }

  /**
   * Get feedback by ID
   * @param {string} feedbackId - Feedback ID
   * @returns {Feedback|null} - Feedback instance or null
   */
  static async getFeedbackById(feedbackId) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('id', feedbackId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Feedback not found');

      return new Feedback(data);
    } catch (error) {
      throw new Error(`Failed to fetch feedback: ${error.message}`);
    }
  }

  /**
   * Get feedback for an event
   * @param {string} eventId - Event ID
   * @returns {array} - Array of feedback with student details
   */
  static async getEventFeedback(eventId) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          students (name, email)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch event feedback: ${error.message}`);
    }
  }

  /**
   * Get feedback from a student
   * @param {string} studentId - Student ID
   * @returns {array} - Array of feedback with event details
   */
  static async getStudentFeedback(studentId) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          events (title, start_date)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch student feedback: ${error.message}`);
    }
  }

  /**
   * Get feedback statistics for an event
   * @param {string} eventId - Event ID
   * @returns {object} - Feedback statistics
   */
  static async getEventFeedbackStats(eventId) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('rating, comments')
        .eq('event_id', eventId);

      if (error) throw error;

      const stats = {
        total_feedback: data.length,
        average_rating: 0,
        rating_distribution: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        },
        total_comments: data.filter(f => f.comments && f.comments.trim()).length
      };

      if (data.length > 0) {
        const totalRating = data.reduce((sum, feedback) => sum + feedback.rating, 0);
        stats.average_rating = Number((totalRating / data.length).toFixed(2));

        // Calculate rating distribution
        data.forEach(feedback => {
          stats.rating_distribution[feedback.rating]++;
        });
      }

      return stats;
    } catch (error) {
      throw new Error(`Failed to fetch event feedback stats: ${error.message}`);
    }
  }

  /**
   * Update feedback
   * @param {string} feedbackId - Feedback ID
   * @param {object} updateData - Data to update
   * @returns {Feedback} - Updated feedback instance
   */
  static async updateFeedback(feedbackId, updateData) {
    try {
      // Validate rating if provided
      if (updateData.rating && !Feedback.isValidRating(updateData.rating)) {
        throw new Error('Invalid rating. Must be between 1 and 5');
      }

      const { data, error } = await supabase
        .from('feedback')
        .update(updateData)
        .eq('id', feedbackId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Feedback not found');

      return new Feedback(data);
    } catch (error) {
      throw new Error(`Failed to update feedback: ${error.message}`);
    }
  }

  /**
   * Delete feedback
   * @param {string} feedbackId - Feedback ID
   * @returns {boolean} - True if deleted successfully
   */
  static async deleteFeedback(feedbackId) {
    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Failed to delete feedback: ${error.message}`);
    }
  }

  /**
   * Check if student has already provided feedback for an event
   * @param {string} studentId - Student ID
   * @param {string} eventId - Event ID
   * @returns {boolean} - True if feedback exists
   */
  static async hasStudentProvidedFeedback(studentId, eventId) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('id')
        .eq('student_id', studentId)
        .eq('event_id', eventId);

      if (error) throw error;
      return data.length > 0;
    } catch (error) {
      throw new Error(`Failed to check feedback existence: ${error.message}`);
    }
  }

  /**
   * Get overall feedback statistics
   * @param {object} filters - Filter options (date range, rating range)
   * @returns {object} - Overall feedback statistics
   */
  static async getOverallFeedbackStats(filters = {}) {
    try {
      let query = supabase.from('feedback').select('rating, created_at');

      if (filters.start_date) {
        query = query.gte('created_at', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total_feedback: data.length,
        average_rating: 0,
        rating_distribution: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        },
        satisfaction_rate: 0 // Percentage of ratings 4 and above
      };

      if (data.length > 0) {
        const totalRating = data.reduce((sum, feedback) => sum + feedback.rating, 0);
        stats.average_rating = Number((totalRating / data.length).toFixed(2));

        // Calculate rating distribution
        data.forEach(feedback => {
          stats.rating_distribution[feedback.rating]++;
        });

        // Calculate satisfaction rate (ratings 4 and 5)
        const satisfiedCount = stats.rating_distribution[4] + stats.rating_distribution[5];
        stats.satisfaction_rate = Number(((satisfiedCount / data.length) * 100).toFixed(2));
      }

      return stats;
    } catch (error) {
      throw new Error(`Failed to fetch overall feedback stats: ${error.message}`);
    }
  }

  /**
   * Get recent feedback
   * @param {number} limit - Number of recent feedback to fetch
   * @returns {array} - Array of recent feedback with event and student details
   */
  static async getRecentFeedback(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          events (title),
          students (name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch recent feedback: ${error.message}`);
    }
  }

  /**
   * Get top rated events based on feedback
   * @param {number} limit - Number of top events to return
   * @returns {array} - Array of events with their average ratings
   */
  static async getTopRatedEvents(limit = 5) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          event_id,
          rating,
          events (title, description)
        `);

      if (error) throw error;

      // Group by event and calculate averages
      const eventRatings = {};
      data.forEach(feedback => {
        if (!eventRatings[feedback.event_id]) {
          eventRatings[feedback.event_id] = {
            event_id: feedback.event_id,
            title: feedback.events.title,
            description: feedback.events.description,
            ratings: [],
            total_feedback: 0
          };
        }
        eventRatings[feedback.event_id].ratings.push(feedback.rating);
        eventRatings[feedback.event_id].total_feedback++;
      });

      // Calculate averages and sort
      const topEvents = Object.values(eventRatings)
        .map(event => ({
          ...event,
          average_rating: Number((event.ratings.reduce((sum, rating) => sum + rating, 0) / event.ratings.length).toFixed(2))
        }))
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, limit);

      return topEvents;
    } catch (error) {
      throw new Error(`Failed to fetch top rated events: ${error.message}`);
    }
  }
}

export default FeedbackService;
