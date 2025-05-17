// Utility to ensure user and thread exist in the database before processing
const dbManager = require('./dbManager');
const logger = require('./logger');

/**
 * Ensure user and thread exist in the database (idempotent)
 * @param {object} api
 * @param {object} event
 */
async function ensureDbEntities(api, event) {
  try {
    const { senderID, threadID } = event;
    if (senderID) {
      const userExists = await dbManager.getUser(senderID);
      if (!userExists) {
        const userInfo = await api.getUserInfo(senderID);
        const userName = userInfo[senderID]?.name || 'Unknown User';
        await dbManager.createUser(senderID, userName);
        logger.debug(`Added new user to database: ${userName} (${senderID})`);
      }
    }
    if (threadID) {
      const threadExists = await dbManager.getGroup(threadID);
      if (!threadExists) {
        const threadInfo = await api.getThreadInfo(threadID);
        const threadName = threadInfo.threadName || 'Unknown Group';
        await dbManager.createGroup(threadID, threadName);
        logger.debug(`Added new thread to database: ${threadName} (${threadID})`);
      }
    }
  } catch (error) {
    logger.error('DB sync error:', error);
  }
}

module.exports = { ensureDbEntities };
