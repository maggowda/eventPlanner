// idGenerator.js
// Purpose: Utility for generating unique IDs (UUID, nanoid, etc.).

import crypto from 'crypto';

/**
 * ID Generator utility class
 */
export class IdGenerator {
  /**
   * Generate a UUID v4
   * @returns {string} - UUID v4 string
   */
  static generateUUID() {
    return crypto.randomUUID();
  }

  /**
   * Generate a short ID (nanoid-like)
   * @param {number} length - Length of the ID (default: 10)
   * @param {string} alphabet - Characters to use (default: URL-safe)
   * @returns {string} - Short ID
   */
  static generateShortId(length = 10, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    const alphabetLength = alphabet.length;
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, alphabetLength);
      result += alphabet[randomIndex];
    }
    
    return result;
  }

  /**
   * Generate a numeric ID
   * @param {number} length - Length of the ID (default: 8)
   * @returns {string} - Numeric ID
   */
  static generateNumericId(length = 8) {
    const alphabet = '0123456789';
    return this.generateShortId(length, alphabet);
  }

  /**
   * Generate an alphanumeric ID (no special characters)
   * @param {number} length - Length of the ID (default: 8)
   * @returns {string} - Alphanumeric ID
   */
  static generateAlphanumericId(length = 8) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return this.generateShortId(length, alphabet);
  }

  /**
   * Generate a readable ID with separators
   * @param {number} segments - Number of segments (default: 3)
   * @param {number} segmentLength - Length of each segment (default: 4)
   * @param {string} separator - Separator character (default: '-')
   * @returns {string} - Readable ID
   */
  static generateReadableId(segments = 3, segmentLength = 4, separator = '-') {
    const parts = [];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    for (let i = 0; i < segments; i++) {
      parts.push(this.generateShortId(segmentLength, alphabet));
    }
    
    return parts.join(separator);
  }

  /**
   * Generate a timestamp-based ID
   * @param {string} prefix - Optional prefix
   * @returns {string} - Timestamp-based ID
   */
  static generateTimestampId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(3).toString('hex');
    return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
  }

  /**
   * Generate a hex ID
   * @param {number} bytes - Number of bytes (default: 16)
   * @returns {string} - Hex ID
   */
  static generateHexId(bytes = 16) {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Generate a base64 ID
   * @param {number} bytes - Number of bytes (default: 16)
   * @returns {string} - Base64 ID (URL-safe)
   */
  static generateBase64Id(bytes = 16) {
    return crypto.randomBytes(bytes).toString('base64url');
  }

  /**
   * Generate an event code (short, memorable)
   * @returns {string} - Event code (e.g., "EVT-ABC123")
   */
  static generateEventCode() {
    return `EVT-${this.generateReadableId(1, 6, '')}`;
  }

  /**
   * Generate a student ID
   * @param {string} collegeCode - College code prefix
   * @returns {string} - Student ID
   */
  static generateStudentId(collegeCode = 'STU') {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = this.generateNumericId(4);
    return `${collegeCode}${year}${random}`;
  }

  /**
   * Generate a registration number
   * @returns {string} - Registration number
   */
  static generateRegistrationNumber() {
    const timestamp = Date.now().toString().slice(-8);
    const random = this.generateNumericId(4);
    return `REG${timestamp}${random}`;
  }

  /**
   * Validate UUID v4 format
   * @param {string} uuid - UUID to validate
   * @returns {boolean} - True if valid UUID v4
   */
  static isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Generate a session ID
   * @returns {string} - Session ID
   */
  static generateSessionId() {
    return this.generateHexId(32);
  }

  /**
   * Generate an API key
   * @param {string} prefix - Optional prefix (default: 'sk')
   * @returns {string} - API key
   */
  static generateApiKey(prefix = 'sk') {
    const key = this.generateBase64Id(32);
    return `${prefix}_${key}`;
  }
}

export default IdGenerator;
