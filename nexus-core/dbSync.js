// Utility to ensure user and thread exist in the database before processing
const dbManager = require('./dbManager');
const logger = require('./logger');

/**
 * Ensure user exists in the database (idempotent)
 * @param {object} api
 * @param {object} event
 */
async function ensureDbEntities(api, event) {
  try {
    const { senderID } = event;
    if (senderID) {
      const userExists = await dbManager.getUser(senderID);
      if (!userExists) {
        const userInfo = await api.getUserInfo(senderID);
        const userName = userInfo[senderID]?.name || 'Unknown User';
        await dbManager.createUser(senderID, userName);
        logger.debug(`Added new user to database: ${userName} (${senderID})`);
      }
    }
  } catch (error) {
    logger.error('DB sync error:', error);
  }
}

module.exports = { ensureDbEntities };
