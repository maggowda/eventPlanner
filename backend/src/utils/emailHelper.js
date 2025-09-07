// emailHelper.js
// Purpose: Utility functions for composing and sending emails.

/**
 * Email helper utility
 * Note: This is a basic implementation. In production, you would integrate with
 * services like SendGrid, Mailgun, AWS SES, or use nodemailer with SMTP.
 */
export class EmailHelper {
  /**
   * Email templates
   */
  static templates = {
    eventRegistration: {
      subject: 'Event Registration Confirmation',
      template: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Event Registration Confirmed</h2>
          <p>Dear ${data.studentName},</p>
          <p>You have successfully registered for the following event:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">${data.eventTitle}</h3>
            <p><strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(data.eventDate).toLocaleTimeString()}</p>
            <p><strong>Location:</strong> ${data.eventLocation}</p>
            <p><strong>Description:</strong> ${data.eventDescription}</p>
          </div>
          <p>Please save this confirmation for your records. We look forward to seeing you at the event!</p>
          <p>Best regards,<br>Event Planning Team</p>
        </div>
      `
    },

    eventCancellation: {
      subject: 'Event Cancellation Notice',
      template: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Event Cancellation Notice</h2>
          <p>Dear ${data.studentName},</p>
          <p>We regret to inform you that the following event has been cancelled:</p>
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #1f2937;">${data.eventTitle}</h3>
            <p><strong>Original Date:</strong> ${new Date(data.eventDate).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${data.eventLocation}</p>
          </div>
          <p>${data.cancellationReason || 'We apologize for any inconvenience this may cause.'}</p>
          <p>If you have any questions, please contact us.</p>
          <p>Best regards,<br>Event Planning Team</p>
        </div>
      `
    },

    eventUpdate: {
      subject: 'Event Update Notification',
      template: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Event Update</h2>
          <p>Dear ${data.studentName},</p>
          <p>There has been an update to an event you're registered for:</p>
          <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #1f2937;">${data.eventTitle}</h3>
            <p><strong>New Date:</strong> ${new Date(data.eventDate).toLocaleDateString()}</p>
            <p><strong>New Time:</strong> ${new Date(data.eventDate).toLocaleTimeString()}</p>
            <p><strong>Location:</strong> ${data.eventLocation}</p>
          </div>
          <p><strong>Changes:</strong></p>
          <ul>
            ${data.changes.map(change => `<li>${change}</li>`).join('')}
          </ul>
          <p>Please update your calendar accordingly.</p>
          <p>Best regards,<br>Event Planning Team</p>
        </div>
      `
    },

    eventReminder: {
      subject: 'Event Reminder',
      template: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Event Reminder</h2>
          <p>Dear ${data.studentName},</p>
          <p>This is a friendly reminder about your upcoming event:</p>
          <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="margin-top: 0; color: #1f2937;">${data.eventTitle}</h3>
            <p><strong>Date:</strong> ${new Date(data.eventDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(data.eventDate).toLocaleTimeString()}</p>
            <p><strong>Location:</strong> ${data.eventLocation}</p>
          </div>
          <p>Don't forget to attend! We're looking forward to seeing you there.</p>
          <p>Best regards,<br>Event Planning Team</p>
        </div>
      `
    },

    welcomeStudent: {
      subject: 'Welcome to Campus Event Platform',
      template: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Campus Event Platform</h2>
          <p>Dear ${data.studentName},</p>
          <p>Welcome to our campus event management system! You have been successfully registered.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your Details:</strong></p>
            <p><strong>Name:</strong> ${data.studentName}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>College:</strong> ${data.collegeName}</p>
          </div>
          <p>You can now register for events, mark attendance, and provide feedback through our platform.</p>
          <p>We hope you enjoy participating in campus events!</p>
          <p>Best regards,<br>Event Planning Team</p>
        </div>
      `
    }
  };

  /**
   * Send email (mock implementation)
   * In production, replace this with actual email service
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} html - HTML content
   * @param {object} options - Additional options
   */
  static async sendEmail(to, subject, html, options = {}) {
    try {
      // Mock email sending - log to console
      console.log('📧 EMAIL SENT:');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Options:', options);
      console.log('HTML Content (truncated):', html.substring(0, 200) + '...');

      // In production, you would implement actual email sending here:
      /*
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter({
        // Configure your email service
      });
      
      await transporter.sendMail({
        to,
        subject,
        html,
        ...options
      });
      */

      return {
        success: true,
        messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message: 'Email sent successfully (mock)'
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send event registration confirmation
   * @param {object} data - Email data
   */
  static async sendEventRegistrationConfirmation(data) {
    const template = this.templates.eventRegistration;
    const html = template.template(data);
    
    return this.sendEmail(
      data.studentEmail,
      template.subject,
      html,
      { category: 'event_registration' }
    );
  }

  /**
   * Send event cancellation notice
   * @param {object} data - Email data
   */
  static async sendEventCancellationNotice(data) {
    const template = this.templates.eventCancellation;
    const html = template.template(data);
    
    return this.sendEmail(
      data.studentEmail,
      template.subject,
      html,
      { category: 'event_cancellation' }
    );
  }

  /**
   * Send event update notification
   * @param {object} data - Email data
   */
  static async sendEventUpdateNotification(data) {
    const template = this.templates.eventUpdate;
    const html = template.template(data);
    
    return this.sendEmail(
      data.studentEmail,
      template.subject,
      html,
      { category: 'event_update' }
    );
  }

  /**
   * Send event reminder
   * @param {object} data - Email data
   */
  static async sendEventReminder(data) {
    const template = this.templates.eventReminder;
    const html = template.template(data);
    
    return this.sendEmail(
      data.studentEmail,
      template.subject,
      html,
      { category: 'event_reminder' }
    );
  }

  /**
   * Send welcome email to new student
   * @param {object} data - Email data
   */
  static async sendWelcomeEmail(data) {
    const template = this.templates.welcomeStudent;
    const html = template.template(data);
    
    return this.sendEmail(
      data.email,
      template.subject,
      html,
      { category: 'welcome' }
    );
  }

  /**
   * Send bulk emails to multiple recipients
   * @param {array} recipients - Array of email addresses
   * @param {string} subject - Email subject
   * @param {string} html - HTML content
   * @param {object} options - Additional options
   */
  static async sendBulkEmail(recipients, subject, html, options = {}) {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail(recipient, subject, html, options);
        results.push({ email: recipient, success: true, result });
      } catch (error) {
        results.push({ email: recipient, success: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Validate email address format
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate unsubscribe link
   * @param {string} email - User email
   * @param {string} type - Email type
   * @returns {string} - Unsubscribe URL
   */
  static generateUnsubscribeLink(email, type) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const token = Buffer.from(`${email}:${type}`).toString('base64');
    return `${baseUrl}/unsubscribe?token=${token}`;
  }

  /**
   * Add standard footer to email HTML
   * @param {string} html - Original HTML
   * @param {object} options - Footer options
   * @returns {string} - HTML with footer
   */
  static addEmailFooter(html, options = {}) {
    const { unsubscribeLink, companyName = 'Campus Event Platform' } = options;
    
    const footer = `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
        <p>This email was sent by ${companyName}</p>
        ${unsubscribeLink ? `<p><a href="${unsubscribeLink}" style="color: #6b7280;">Unsubscribe</a> from these notifications</p>` : ''}
        <p>Please do not reply to this email. If you have questions, contact our support team.</p>
      </div>
    `;
    
    return html + footer;
  }
}

export default EmailHelper;
