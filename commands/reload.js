// filepath: commands/reload.js
// Admin command to reload commands and events without full restart

module.exports = {
  config: {
    name: "reload",
    aliases: ["reloadcmd", "reloadevents"],
    version: "1.0.0",
    author: "NexusTeam",
    countDown: 5,
    role: 2,
    shortDescription: "Reload commands/events",
    longDescription: "Reload all commands and events without restarting the bot.",
    category: "admin",
    guide: "{prefix}reload"
  },
  async execute({ api, event }) {
    try {
      const { loadCommands } = require('../nexus-core/commandHandler');
      const { loadEvents } = require('../nexus-core/eventHandler');
      loadCommands();
      loadEvents();
      api.sendMessage('✅ Commands and events reloaded.', event.threadID);
    } catch (e) {
      api.sendMessage('❌ Reload failed: ' + e.message, event.threadID);
    }
  }
};
