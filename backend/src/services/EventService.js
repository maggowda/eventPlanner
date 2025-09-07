// EventService.js
// Purpose: Business logic for creating, retrieving, updating, deleting events and related operations.

import { supabase } from '../config/database.js';
import { Event } from '../models/Event.js';

export class EventService {
  // Create a new event
  static async createEvent(eventData) {
    try {
      const event = Event.create(eventData);
      
      const { data, error } = await supabase
        .from('events')
        .insert([event.toJSON()])
        .select()
        .single();

      if (error) throw error;
      return new Event(data);
    } catch (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  // Get all events with optional filtering
  static async getAllEvents(filters = {}) {
    try {
      let query = supabase.from('events').select('*');

      // Apply filters
      if (filters.college_id) {
        query = query.eq('college_id', filters.college_id);
      }
      if (filters.date_from) {
        query = query.gte('date', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('date', filters.date_to);
      }

      const { data, error } = await query.order('date', { ascending: true });

      if (error) throw error;
      return data.map(event => new Event(event));
    } catch (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }
  }

  // Get event by ID
  static async getEventById(eventId) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Event not found');

      return new Event(data);
    } catch (error) {
      throw new Error(`Failed to fetch event: ${error.message}`);
    }
  }

  // Update event
  static async updateEvent(eventId, updateData) {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Event not found');

      return new Event(data);
    } catch (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }
  }

  // Delete event
  static async deleteEvent(eventId) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  // Get upcoming events
  static async getUpcomingEvents(collegeId = null) {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString());

      if (collegeId) {
        query = query.eq('college_id', collegeId);
      }

      const { data, error } = await query.order('date', { ascending: true });

      if (error) throw error;
      return data.map(event => new Event(event));
    } catch (error) {
      throw new Error(`Failed to fetch upcoming events: ${error.message}`);
    }
  }

  // Get events with registration count
  static async getEventsWithRegistrationCount(collegeId = null) {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          registrations!inner(count)
        `);

      if (collegeId) {
        query = query.eq('college_id', collegeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data.map(item => ({
        ...new Event(item).toJSON(),
        registration_count: item.registrations?.count || 0
      }));
    } catch (error) {
      throw new Error(`Failed to fetch events with registration count: ${error.message}`);
    }
  }

  // Check if event is full
  static async isEventFull(eventId) {
    try {
      const event = await this.getEventById(eventId);
      
      const { count, error } = await supabase
        .from('registrations')
        .select('*', { count: 'exact' })
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      if (error) throw error;
      return count >= event.max_attendees;
    } catch (error) {
      throw new Error(`Failed to check if event is full: ${error.message}`);
    }
  }

  // Get available spots for event
  static async getAvailableSpots(eventId) {
    try {
      const event = await this.getEventById(eventId);
      
      const { count, error } = await supabase
        .from('registrations')
        .select('*', { count: 'exact' })
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      if (error) throw error;
      return Math.max(0, event.max_attendees - count);
    } catch (error) {
      throw new Error(`Failed to get available spots: ${error.message}`);
    }
  }
}

export default EventService;
