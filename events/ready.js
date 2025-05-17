const logger = require('../nexus-core/logger');
const { getNotifier } = require('../nexus-core/adminNotifier');

module.exports = {
  config: {
    name: "ready",
    version: "1.0.0",
    description: "Initializes systems when bot is ready"
  },

  execute: async function({ api, event, config }) {
    // Only run this once when bot starts
    if (!event || event.type !== 'ready') return;
    
    try {
      logger.info("Bot is ready! Initializing systems...");
      
      // Initialize admin notifier
      const notifier = getNotifier(api);
      global.adminNotifier = notifier;
      
      // Notify admins that bot is online
      const uptime = process.uptime();
      await notifier.notify(`✅ Bot is now online and ready!\nStartup time: ${uptime.toFixed(2)} seconds`);
      
      logger.info("All systems initialized!");
    } catch (error) {
      logger.error("Error in ready event:", error);
    }
  }
};
