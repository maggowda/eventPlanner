// cryptoHelper.js
// Purpose: Cryptographic utilities (hashing passwords, comparing hashes, generating tokens/secrets).

import crypto from 'crypto';
import bcrypt from 'bcrypt';

export class CryptoHelper {
  // Salt rounds for bcrypt
  static SALT_ROUNDS = 12;

  /**
   * Hash a password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  static async hashPassword(password) {
    try {
      const hash = await bcrypt.hash(password, this.SALT_ROUNDS);
      return hash;
    } catch (error) {
      throw new Error(`Failed to hash password: ${error.message}`);
    }
  }

  /**
   * Compare a plain text password with a hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} - True if password matches
   */
  static async comparePassword(password, hash) {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      throw new Error(`Failed to compare password: ${error.message}`);
    }
  }

  /**
   * Generate a secure random token
   * @param {number} length - Token length in bytes (default: 32)
   * @returns {string} - Hex encoded token
   */
  static generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a random UUID v4
   * @returns {string} - UUID v4 string
   */
  static generateUUID() {
    return crypto.randomUUID();
  }

  /**
   * Generate a secure random string for API keys, passwords, etc.
   * @param {number} length - Length of the string (default: 24)
   * @param {string} charset - Character set to use
   * @returns {string} - Random string
   */
  static generateRandomString(length = 24, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    const charsetLength = charset.length;
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charsetLength);
      result += charset[randomIndex];
    }
    
    return result;
  }

  /**
   * Generate a hash of data using SHA-256
   * @param {string} data - Data to hash
   * @returns {string} - Hex encoded hash
   */
  static generateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate HMAC signature
   * @param {string} data - Data to sign
   * @param {string} secret - Secret key
   * @param {string} algorithm - HMAC algorithm (default: sha256)
   * @returns {string} - Hex encoded signature
   */
  static generateHMAC(data, secret, algorithm = 'sha256') {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   * @param {string} data - Original data
   * @param {string} signature - Signature to verify
   * @param {string} secret - Secret key
   * @param {string} algorithm - HMAC algorithm (default: sha256)
   * @returns {boolean} - True if signature is valid
   */
  static verifyHMAC(data, signature, secret, algorithm = 'sha256') {
    const expectedSignature = this.generateHMAC(data, secret, algorithm);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Generate a time-based one-time password (TOTP) secret
   * @returns {string} - Base32 encoded secret
   */
  static generateTOTPSecret() {
    const secret = crypto.randomBytes(20);
    return secret.toString('base32');
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param {string} text - Text to encrypt
   * @param {string} key - Encryption key (32 bytes)
   * @returns {object} - Object with encrypted data, iv, and authTag
   */
  static encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', key);
    cipher.setAAD(Buffer.from('auth-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param {object} encryptedData - Object with encrypted, iv, and authTag
   * @param {string} key - Decryption key
   * @returns {string} - Decrypted text
   */
  static decrypt(encryptedData, key) {
    const { encrypted, iv, authTag } = encryptedData;
    const decipher = crypto.createDecipher('aes-256-gcm', key);
    decipher.setAAD(Buffer.from('auth-data'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

export default CryptoHelper;
