const logger = require('../nexus-core/logger');
const safeApi = require('../nexus-core/apiHelpers');
const dbManager = require('../nexus-core/dbManager');
const { ensureDbEntities } = require('../nexus-core/dbSync');

/**
 * MessageEvent - Handles message events with optimized typing indicators
 * and keyword-based responses
 */
module.exports = {
  config: {
    name: "messageEvent",
    version: "1.3.0",
    description: "Handles incoming message events, keywords and database syncing"
  },

  execute: async function ({ api, event, config }) {
    // Skip invalid events quickly
    if (!event || !event.threadID || !event.type || event.type !== 'message') {
      return;
    }

    // Ensure user and thread exist in the database
    await ensureDbEntities(api, event);

    // Initialize global message count if not exists
    if (typeof global.messageCount === 'undefined') {
      global.messageCount = 0;
    }
    
    // Increment message count for stats
    global.messageCount++;
    
    try {
      // Get messaging configuration with defaults
      const messagingConfig = {
        autoRead: true,
        typingIndicator: false, // Disabled by default due to potential issues
        ...config?.behavior?.messageHandling
      };
      
      // Check for no-prefix keywords if message exists
      if (event.body && !event.body.startsWith(config?.prefix || '!')) {
        await handleKeywords(api, event, config);
      }
      
      // Skip commands - they're handled by the command handler
      if (event.body?.startsWith(config?.prefix || '!')) {
        return;
      }
      
      // Only process direct messages and significant events
      if (event.body) {
        // Process typing indicators with rate limiting
        // Only enable typing indicators if explicitly configured
        if (messagingConfig.typingIndicator === true) {
          // Simple in-memory cache to avoid excessive typing indicators
          const typingKey = `typing_${event.threadID}`;
          const lastTyping = global.messageCache?.get(typingKey);
          
          // Only send typing indicator every 30 seconds per thread
          if (!lastTyping || (Date.now() - lastTyping > 30000)) {
            try {
              await safeApi.sendTypingIndicator(api, event.threadID);
              global.messageCache?.set(typingKey, Date.now(), 60);
            } catch (err) {
              // Silently fail - typing indicators aren't critical
            }
          }
        }
        
        // Mark as read if enabled (more important than typing indicators)
        if (messagingConfig.autoRead) {
          const readKey = `read_${event.threadID}`;
          const lastRead = global.messageCache?.get(readKey);
          
          // Only mark as read every 10 seconds to avoid spam
          if (!lastRead || (Date.now() - lastRead > 10000)) {
            await safeApi.markAsRead(api, event.threadID).catch(() => {});
            global.messageCache?.set(readKey, Date.now(), 30);
          }
        }
      }
    } catch (error) {
      // Use debug level to avoid flooding logs with non-critical errors
      logger.debug(`Message handling error: ${error.message}`);
    }
  }
};

/**
 * Handle messages that contain keywords without prefix
 * @param {Object} api - Facebook API
 * @param {Object} event - Message event
 * @param {Object} config - Bot config
 */
async function handleKeywords(api, event, config) {
  const { body, threadID, messageID, senderID } = event;
  const lowerBody = body.toLowerCase().trim();
  
  // Skip messages from the bot itself
  if (senderID === api.getCurrentUserID()) {
    return;
  }
  
  // Get thread-specific prefix
  const threadPrefix = global.threadPrefixes?.get(threadID) || config?.prefix || '!';
  
  // Check for keywords and respond
  const keywords = [
    { 
      triggers: ['bot', 'hey bot', 'hi bot', 'nexus'], 
      response: `👋 I'm here! My prefix is "${threadPrefix}" (Example: ${threadPrefix}help)`
    },
    { 
      triggers: ['prefix', 'what is the prefix', 'what\'s the prefix'],
      response: `The prefix for this chat is "${threadPrefix}"`
    },
    {
      triggers: ['hello', 'hi', 'hey'],
      response: `👋 Hello there! Need help? Use ${threadPrefix}help to see my commands.`
    }
    // Add more keyword responses here
  ];
  
  // Create a way for admins to add custom keywords
  if (global.customKeywords && global.customKeywords.size > 0) {
    global.customKeywords.forEach(keyword => {
      if (keyword.triggers && keyword.response) {
        keywords.push(keyword);
      }
    });
  }
  
  // Check if message matches any keyword
  for (const keyword of keywords) {
    if (keyword.triggers.some(trigger => {
      // Exact match
      if (lowerBody === trigger.toLowerCase()) {
        return true;
      }
      // Starts with (for phrases like "bot help me")
      if (lowerBody.startsWith(trigger.toLowerCase() + ' ')) {
        return true;
      }
      return false;
    })) {
      // Send the response with typing indicator first
      await safeApi.sendTypingIndicator(api, threadID);
      setTimeout(() => {
        api.sendMessage(keyword.response, threadID, messageID);
      }, 500);
      
      return;
    }
  }
}
