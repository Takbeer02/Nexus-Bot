const logger = require('./logger');
const messageUtils = require('./messageUtils');

/**
 * Helper functions for the Facebook API
 */
class ApiHelpers {
  /**
   * Initialize with an API instance
   * @param {Object} api - The Facebook API instance
   */
  constructor(api) {
    this.api = api;
  }

  /**
   * Send typing indicator with error handling
   * @param {string} threadID - Thread ID to send typing indicator to
   * @returns {Promise<void>}
   */
  sendTypingIndicator(threadID) {
    return new Promise(async (resolve) => {
      try {
        if (!this.api || !this.api.sendTypingIndicator) {
          logger.warn('Cannot send typing indicator: API not available');
          return resolve();
        }

        // Try using the patched typing indicator
        await this.api.sendTypingIndicator(threadID).catch(err => {
          logger.debug('Error sending typing indicator:', err);
        });
        
        resolve();
      } catch (error) {
        // Don't throw errors for typing indicators, just log and continue
        logger.debug('Failed to send typing indicator:', error);
        resolve();
      }
    });
  }
  
  /**
   * Send message with error handling
   * @param {Object} message - Message to send
   * @returns {Promise<string|null>} Message ID if sent successfully
   */
  sendMessage(message, threadID) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.api || !this.api.sendMessage) {
          return reject(new Error('API not available'));
        }
        
        this.api.sendMessage(message, threadID, (err, msgInfo) => {
          if (err) {
            logger.error('Error sending message:', err);
            return reject(err);
          }
          resolve(msgInfo);
        });
      } catch (error) {
        logger.error('Exception sending message:', error);
        reject(error);
      }
    });
  }
}

module.exports = ApiHelpers;
