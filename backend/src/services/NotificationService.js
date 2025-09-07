// NotificationService.js
// Purpose: Handle email/SMS/push notifications related to events and registrations.

import { EmailHelper } from '../utils/emailHelper.js';
import { supabase } from '../config/database.js';

export class NotificationService {
  /**
   * Send event registration confirmation
   * @param {object} studentData - Student data
   * @param {object} eventData - Event data
   * @returns {boolean} - Success status
   */
  static async sendEventRegistrationConfirmation(studentData, eventData) {
    try {
      const subject = `Registration Confirmed: ${eventData.title}`;
      const emailHtml = EmailHelper.generateEventRegistrationEmail(studentData, eventData);
      
      await EmailHelper.sendEmail(studentData.email, subject, emailHtml);
      
      // Log notification
      await this.logNotification({
        type: 'registration_confirmation',
        recipient_email: studentData.email,
        subject: subject,
        event_id: eventData.id,
        student_id: studentData.id
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to send registration confirmation: ${error.message}`);
    }
  }

  /**
   * Send event reminder
   * @param {object} studentData - Student data
   * @param {object} eventData - Event data
   * @param {string} reminderType - Type of reminder (24h, 1h, etc.)
   * @returns {boolean} - Success status
   */
  static async sendEventReminder(studentData, eventData, reminderType = '24h') {
    try {
      const subject = `Reminder: ${eventData.title} - ${reminderType} before start`;
      const emailHtml = EmailHelper.generateEventReminderEmail(studentData, eventData, reminderType);
      
      await EmailHelper.sendEmail(studentData.email, subject, emailHtml);
      
      // Log notification
      await this.logNotification({
        type: 'event_reminder',
        recipient_email: studentData.email,
        subject: subject,
        event_id: eventData.id,
        student_id: studentData.id,
        metadata: { reminder_type: reminderType }
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to send event reminder: ${error.message}`);
    }
  }

  /**
   * Send event cancellation notice
   * @param {object} studentData - Student data
   * @param {object} eventData - Event data
   * @param {string} reason - Cancellation reason
   * @returns {boolean} - Success status
   */
  static async sendEventCancellationNotice(studentData, eventData, reason = 'Administrative reasons') {
    try {
      const subject = `Event Cancelled: ${eventData.title}`;
      const emailHtml = EmailHelper.generateEventCancellationEmail(studentData, eventData, reason);
      
      await EmailHelper.sendEmail(studentData.email, subject, emailHtml);
      
      // Log notification
      await this.logNotification({
        type: 'event_cancellation',
        recipient_email: studentData.email,
        subject: subject,
        event_id: eventData.id,
        student_id: studentData.id,
        metadata: { cancellation_reason: reason }
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to send cancellation notice: ${error.message}`);
    }
  }

  /**
   * Send bulk notifications to multiple recipients
   * @param {array} recipients - Array of recipient objects {email, name, ...}
   * @param {string} subject - Email subject
   * @param {string} htmlContent - Email HTML content
   * @param {object} metadata - Additional metadata
   * @returns {object} - Results summary
   */
  static async sendBulkNotifications(recipients, subject, htmlContent, metadata = {}) {
    try {
      const results = {
        total: recipients.length,
        sent: 0,
        failed: 0,
        errors: []
      };

      for (const recipient of recipients) {
        try {
          await EmailHelper.sendEmail(recipient.email, subject, htmlContent);
          
          // Log successful notification
          await this.logNotification({
            type: 'bulk_notification',
            recipient_email: recipient.email,
            subject: subject,
            student_id: recipient.id || null,
            metadata: metadata
          });

          results.sent++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            email: recipient.email,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to send bulk notifications: ${error.message}`);
    }
  }

  /**
   * Send feedback request
   * @param {object} studentData - Student data
   * @param {object} eventData - Event data
   * @returns {boolean} - Success status
   */
  static async sendFeedbackRequest(studentData, eventData) {
    try {
      const subject = `Share Your Feedback: ${eventData.title}`;
      const emailHtml = EmailHelper.generateFeedbackRequestEmail(studentData, eventData);
      
      await EmailHelper.sendEmail(studentData.email, subject, emailHtml);
      
      // Log notification
      await this.logNotification({
        type: 'feedback_request',
        recipient_email: studentData.email,
        subject: subject,
        event_id: eventData.id,
        student_id: studentData.id
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to send feedback request: ${error.message}`);
    }
  }

  /**
   * Log notification to database
   * @param {object} notificationData - Notification data
   * @returns {object} - Created notification log
   */
  static async logNotification(notificationData) {
    try {
      const logData = {
        type: notificationData.type,
        recipient_email: notificationData.recipient_email,
        subject: notificationData.subject,
        event_id: notificationData.event_id || null,
        student_id: notificationData.student_id || null,
        status: 'sent',
        metadata: notificationData.metadata || {},
        sent_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notification_logs')
        .insert([logData])
        .select()
        .single();

      if (error) {
        console.error('Failed to log notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to log notification:', error.message);
      return null;
    }
  }

  /**
   * Schedule event reminders for upcoming events
   * @param {number} hoursAhead - Hours ahead to check for events
   * @returns {object} - Results summary
   */
  static async scheduleEventReminders(hoursAhead = 24) {
    try {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + (hoursAhead * 60 * 60 * 1000));

      // Get upcoming events
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .gte('start_date', startTime.toISOString())
        .lte('start_date', endTime.toISOString())
        .eq('status', 'active');

      if (error) throw error;

      const results = {
        events_processed: events.length,
        reminders_sent: 0,
        errors: []
      };

      for (const event of events) {
        try {
          // Get registered students for this event
          const { data: registrations } = await supabase
            .from('registrations')
            .select(`
              *,
              students (*)
            `)
            .eq('event_id', event.id)
            .eq('status', 'confirmed');

          if (registrations) {
            for (const registration of registrations) {
              try {
                await this.sendEventReminder(
                  registration.students,
                  event,
                  `${hoursAhead}h`
                );
                results.reminders_sent++;
              } catch (error) {
                results.errors.push({
                  event_id: event.id,
                  student_id: registration.student_id,
                  error: error.message
                });
              }
            }
          }
        } catch (error) {
          results.errors.push({
            event_id: event.id,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to schedule event reminders: ${error.message}`);
    }
  }
}

export default NotificationService;
