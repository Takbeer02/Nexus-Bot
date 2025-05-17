// filepath: commands/stats.js
// Admin command to show bot/system stats

const os = require('os');
const { formatDuration } = require('../nexus-core/utils');

module.exports = {
  config: {
    name: "stats",
    aliases: ["system", "botstats"],
    version: "1.0.0",
    author: "NexusTeam",
    countDown: 5,
    role: 2,
    shortDescription: "Show bot/system stats",
    longDescription: "Show stats about the bot, system, and database.",
    category: "admin",
    guide: "{prefix}stats"
  },
  async execute({ api, event }) {
    const dbManager = require('../nexus-core/dbManager');
    const uptime = formatDuration(process.uptime() * 1000);
    const mem = process.memoryUsage();
    const cpu = os.cpus()[0].model;
    const threads = await dbManager.countGroups();
    const users = await dbManager.countUsers();
    const msg = `🤖 Bot Stats:
- Uptime: ${uptime}
- Memory: ${(mem.rss/1024/1024).toFixed(1)} MB
- CPU: ${cpu}
- Threads: ${threads}
- Users: ${users}`;
    api.sendMessage(msg, event.threadID);
  }
};
