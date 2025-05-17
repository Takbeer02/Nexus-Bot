const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const config = require('../config.json');
const fileWatcher = require('./fileWatcher');
const FileWatcher = require('./fileWatcher');

const commands = new Map();
const cooldowns = new Map();

function loadCommands() {
  const commandFiles = fs.readdirSync(path.join(__dirname, '../commands'))
    .filter(file => file.endsWith('.js'));

  commands.clear(); // Clear existing commands first

  for (const file of commandFiles) {
    try {
      delete require.cache[require.resolve(`../commands/${file}`)]; // Clear require cache
      const command = require(`../commands/${file}`);
      
      // Only add command if it's not already registered
      if (!commands.has(command.config.name)) {
        commands.set(command.config.name, command);
        logger.info(`Loaded command: ${command.config.name} [${command.config.category}]`);
      }
    } catch (error) {
      logger.error(`Failed to load command ${file}:`, error);
    }
  }

  return commands;
}

// Add new function to reload specific command
async function reloadCommand(filename) {
  try {
    const commandPath = path.join(__dirname, '../commands', filename);
    
    // Clear require cache
    try {
      delete require.cache[require.resolve(commandPath)];
    } catch (cacheError) {
      logger.error(`Failed to clear cache for ${filename}:`, cacheError);
      throw new Error(`Cache clear error: ${cacheError.message}`);
    }
    
    // Require the updated command
    let command;
    try {
      command = require(commandPath);
    } catch (requireError) {
      logger.error(`Failed to require command ${filename}:`, requireError);
      notifyAdmin(`⚠️ Failed to reload command "${filename}": ${requireError.message}`);
      throw new Error(`Require error: ${requireError.message}`);
    }
    
    // Check if the command has the needed structure
    if (!command || !command.config || !command.config.name) {
      const errorMsg = `Invalid command format: ${filename} is missing config or name property`;
      logger.error(errorMsg);
      notifyAdmin(`⚠️ ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    // Add command to commands map
    commands.set(command.config.name, command);
    logger.info(`🔄 Reloaded command: ${command.config.name}`);
    
    // Notify admin about the successful update
    notifyAdmin(`🔄 Command "${command.config.name}" has been updated and reloaded successfully.`);
    
    return command;
  } catch (error) {
    logger.error(`Failed to reload command ${filename}:`, error);
    return null;
  }
}

/**
 * Helper function to safely notify the admin with multiple fallbacks
 * @param {string} message - The message to send
 */
function notifyAdmin(message) {
  // Log the message as fallback
  logger.info(`Admin message: ${message}`);
  console.log(`[Admin notification] ${message}`);
  
  // Use our centralized admin notifier if available
  try {
    const adminNotifier = require('../utils/adminNotifier');
    if (global.api) {
      const notifier = adminNotifier.getNotifier(global.api);
      notifier.notify(message).catch(error => {
        logger.debug(`Failed to send notification: ${error.message}`);
      });
      return;
    }
  } catch (error) {
    logger.debug(`Admin notifier error: ${error.message}`);
    // Fall through to legacy code
  }
  
  // Legacy notification code as fallback
  try {
    // Exit early if API is not available
    if (!global.api) {
      logger.debug("Can't notify admin: API not available");
      return;
    }
    
    // Get admin IDs with maximum safety
    let adminId = null;
    try {
      const config = global.config || require('../config.json');
      
      // Try owner first (highest permission)
      if (config.botConfig.owner) {
        adminId = config.botConfig.owner;
      }
      // Then try regular admins
      else if (config.botConfig.admins && Array.isArray(config.botConfig.admins) && config.botConfig.admins.length > 0) {
        // Get the first valid admin ID
        for (const id of config.botConfig.admins) {
          if (id && typeof id === 'string' && id.length > 5) {
            adminId = id;
            break;
          }
        }
      }
    } catch (error) {
      logger.error("Error getting admin IDs:", error.message);
    }
    
    // If we still don't have an admin ID, give up
    if (!adminId) {
      logger.debug("No valid admin IDs found for notification");
      return;
    }
    
    // Try to send to user's inbox instead of thread
    global.api.sendMessage(message, adminId)
      .then(() => {
        logger.debug(`Admin notification sent to ${adminId}`);
      })
      .catch(error => {
        const errorMsg = error.message || 'Unknown error';
        if (errorMsg.includes('Thread Disabled')) {
          logger.warn(`Admin notification failed: Thread is disabled for admin ${adminId}`);
        } else {
          logger.error(`Failed to notify admin ${adminId}: ${errorMsg}`);
        }
      });
  } catch (outerError) {
    logger.error('Exception in legacy admin notification:', outerError);
  }
}

// Initialize file watcher when commands are first loaded
function initializeCommandWatcher() {
  const commandsDir = path.join(__dirname, '../commands');
  const watcher = new FileWatcher(commandsDir, reloadCommand);
  watcher.start();
}

async function handleCommand(api, event) {
  if (!global.client) global.client = {};
  if (!global.client.handleReply) global.client.handleReply = [];
  if (!global.client.handleReaction) global.client.handleReaction = [];

  const { body, senderID, threadID, messageID, type } = event;
  const threadPrefix = global.threadPrefixes?.get(threadID);
  const defaultPrefix = global.config?.prefix || '!';

  // Helper to get required role for a handler type
  function getHandlerRole(command, handlerType) {
    if (!command.config.role) return 0;
    if (typeof command.config.role === 'object') {
      return command.config.role[handlerType] ?? command.config.role.run ?? 0;
    }
    return command.config.role;
  }

  // 1. onReply (for reply flows)
  if (event.messageReply) {
    const handler = global.client.handleReply.find(h => h.messageID === event.messageReply.messageID);
    if (handler) {
      const command = commands.get(handler.name);
      const requiredRole = getHandlerRole(command, 'onReply');
      const userRole = await global.permissionManager?.getUserRole?.(senderID) ?? 0;
      if (userRole < requiredRole) return;
      if (command && typeof command.onReply === 'function') {
        await command.onReply({ api, event, handleReply: handler });
        return;
      } else if (command && typeof command.handleReply === 'function') {
        await command.handleReply({ api, event, handleReply: handler });
        return;
      }
    }
  }

  // 2. onReaction (for message reactions)
  if (type === 'message_reaction' && global.client.handleReaction) {
    const handleReaction = global.client.handleReaction.find(h => h.messageID === event.messageID);
    if (handleReaction) {
      const command = commands.get(handleReaction.name);
      const requiredRole = getHandlerRole(command, 'onReaction');
      const userRole = await global.permissionManager?.getUserRole?.(senderID) ?? 0;
      if (userRole < requiredRole) return;
      if (command && typeof command.onReaction === 'function') {
        await command.onReaction({ api, event, handleReaction });
        return;
      } else if (command && typeof command.handleReaction === 'function') {
        await command.handleReaction({ api, event, handleReaction });
        return;
      }
    }
  }

  // 3. onChat (for every message, not just commands)
  for (const command of commands.values()) {
    if (typeof command.onChat === 'function' && type === 'message') {
      const requiredRole = getHandlerRole(command, 'onChat');
      const userRole = await global.permissionManager?.getUserRole?.(senderID) ?? 0;
      if (userRole < requiredRole) continue;
      await command.onChat({ api, event });
    }
  }

  // 4. Normal command processing (run/execute)
  let usedPrefix = null;
  let messageContent = '';
  if (threadPrefix && body && body.startsWith(threadPrefix)) {
    usedPrefix = threadPrefix;
    messageContent = body.slice(threadPrefix.length).trim();
  } else if (body && body.startsWith(defaultPrefix)) {
    usedPrefix = defaultPrefix;
    messageContent = body.slice(defaultPrefix.length).trim();
  }
  if (!usedPrefix) return;
  if (messageContent === '') {
    return api.sendMessage(`To see available commands, use ${usedPrefix}help`, threadID, messageID);
  }
  const args = messageContent.split(/ +/);
  const commandName = args.shift().toLowerCase();
  let command = commands.get(commandName);
  if (!command) {
    for (const [name, cmd] of commands.entries()) {
      if (cmd.config.aliases && Array.isArray(cmd.config.aliases) && cmd.config.aliases.includes(commandName)) {
        command = cmd;
        break;
      }
    }
  }
  if (!command) {
    return api.sendMessage(`❌ Command "${commandName}" not found. Use ${usedPrefix}help to see available commands.`, threadID, messageID);
  }
  // Permission, cooldown, etc. (unchanged)
  try {
    const requiredRole = getHandlerRole(command, 'run');
    const userRole = await global.permissionManager?.getUserRole?.(senderID) ?? 0;
    if (userRole < requiredRole) return api.sendMessage("❌ You do not have permission to use this command.", threadID);
    if (typeof command.run === 'function') {
      await command.run({ api, event, args, commands, prefix: usedPrefix, Users: global.Users, Threads: global.Threads });
    } else if (typeof command.execute === 'function') {
      await command.execute({ api, event, args, commands, prefix: usedPrefix, Users: global.Users, Threads: global.Threads });
    }
    if (typeof global.commandAnalytics === 'function') {
      await global.commandAnalytics(command.config.name, command.config.category);
    }
  } catch (error) {
    logger.error(`Error executing ${command.config.name}:`, error);
    api.sendMessage("❌ An error occurred while executing this command.", threadID);
  }
}

/**
 * Fallback permission check when permission manager is unavailable
 * @param {Object} api - Facebook API 
 * @param {String} userId - User ID
 * @param {String} threadId - Thread ID
 * @param {Number} requiredRole - Required role level
 * @returns {Promise<boolean>} Whether user has permission
 */
async function fallbackPermissionCheck(api, userId, threadId, requiredRole) {
  try {
    // Load config directly as fallback
    const config = global.config || require('../config.json');
    
    // Check for bot owner (role 3)
    if (config.botConfig.owner === userId) {
      return true;
    }
    
    // Check for bot admin (role 2)
    if (requiredRole <= 2 && Array.isArray(config.botConfig.admins) && config.botConfig.admins.includes(userId)) {
      return true;
    }
    
    // Check for thread admin (role 1)
    if (requiredRole <= 1) {
      try {
        // Get thread info to check admin status
        const threadInfo = await new Promise((resolve, reject) => {
          api.getThreadInfo(threadId, (err, info) => {
            if (err) reject(err);
            else resolve(info);
          });
        });
        
        // Check if user is admin of the thread
        if (threadInfo && 
            Array.isArray(threadInfo.adminIDs) && 
            threadInfo.adminIDs.some(admin => admin.id === userId)) {
          return true;
        }
      } catch (threadError) {
        logger.error("Error checking thread admin status:", threadError);
      }
    }
    
    // User doesn't have the required permission
    return false;
  } catch (error) {
    logger.error("Error in fallback permission check:", error);
    return false;
  }
}

// Modify module exports to include the new functionality
module.exports = { 
  loadCommands, 
  handleCommand, 
  commands,
  initializeCommandWatcher,
  notifyAdmin
};
