const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const events = new Map();

function loadEvents() {
  const eventFiles = fs.readdirSync(path.join(__dirname, '../events'))
    .filter(file => file.endsWith('.js'));

  events.clear(); // Clear existing events first

  for (const file of eventFiles) {
    try {
      delete require.cache[require.resolve(`../events/${file}`)];
      const event = require(`../events/${file}`);
      if (event.config && event.config.name) {
        events.set(event.config.name, event);
        logger.info(`Loaded event: ${event.config.name}`);
      }
    } catch (error) {
      logger.error(`Failed to load event ${file}: ${error.message}`);
    }
  }
}

async function handleEvent(api, event) {
  try {
    const config = global.config || {};
    for (const [name, handler] of events) {
      try {
        // Permission check if required by event config
        if (handler.config && handler.config.role && global.permissionManager) {
          const senderID = event.senderID;
          const threadID = event.threadID;
          const requiredRole = handler.config.role;
          const userRole = await global.permissionManager.getUserRole(senderID);
          if (userRole < requiredRole) continue;
        }
        // Advanced event handler patterns
        if (event.type === 'message' && typeof handler.onChat === 'function') {
          await handler.onChat({ api, event, config });
        }
        if (event.type === 'message_reply' && typeof handler.onReply === 'function') {
          await handler.onReply({ api, event, config });
        }
        if (event.type === 'message_reaction' && typeof handler.onReaction === 'function') {
          await handler.onReaction({ api, event, config });
        }
        // Fallback to execute if present
        if (typeof handler.execute === 'function') {
          await handler.execute({ api, event, config });
        }
      } catch (handlerError) {
        logger.error(`Error in event handler ${name}:`, handlerError.message);
      }
    }
  } catch (error) {
    logger.error('Error in event system:', error);
  }
}

module.exports = { loadEvents, handleEvent, events };
