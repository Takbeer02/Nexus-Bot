// filepath: commands/resync.js
// Admin command to force a full DB resync (batch sync)

module.exports = {
  config: {
    name: "resync",
    aliases: ["dbresync", "syncdb"],
    version: "1.0.0",
    author: "NexusTeam",
    countDown: 10,
    role: 2, // Bot admin or higher
    shortDescription: "Force DB resync",
    longDescription: "Force a full database resync of all threads and users.",
    category: "admin",
    guide: "{prefix}resync"
  },
  async execute({ api, event }) {
    const InitSystem = require('../nexus-core/initSystem');
    await InitSystem.batchSyncDatabaseEntities(api);
    api.sendMessage("✅ Database resync complete.", event.threadID);
  }
};
