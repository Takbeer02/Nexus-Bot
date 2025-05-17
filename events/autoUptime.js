const axios = require('axios');
const logger = require('../nexus-core/logger');

module.exports = {
  config: {
    name: "autoUptime",
    version: "1.0.0",
    description: "Periodically pings a URL to keep the bot alive (Replit/Glitch/etc)",
    interval: 180, // seconds
    enabled: true // set false to disable
  },
  onLoad: async function({ config }) {
    const botConfig = config?.autoUptime || {};
    if (botConfig.enabled === false) return;
    const interval = (botConfig.interval || 180) * 1000;
    let url = botConfig.url || process.env.UPTIME_URL;
    if (!url) {
      logger.info('[autoUptime] No URL configured, skipping uptime pings.');
      return;
    }
    logger.info(`[autoUptime] Pinging ${url} every ${interval/1000}s`);
    setInterval(async () => {
      try {
        await axios.get(url);
        logger.debug(`[autoUptime] Pinged ${url} successfully.`);
      } catch (e) {
        logger.warn(`[autoUptime] Failed to ping ${url}: ${e.message}`);
      }
    }, interval);
  }
};
