// filepath: commands/errors.js
// Admin command to show last 10 errors from error.log

const fs = require('fs');
const path = require('path');
const { truncate } = require('../nexus-core/utils');

module.exports = {
  config: {
    name: "errors",
    aliases: ["lasterrors", "errlog"],
    version: "1.0.0",
    author: "NexusTeam",
    countDown: 5,
    role: 2,
    shortDescription: "Show last 10 errors",
    longDescription: "Show the last 10 errors from the error log.",
    category: "admin",
    guide: "{prefix}errors"
  },
  async execute({ api, event }) {
    const logPath = path.join(process.cwd(), 'logs', 'error.log');
    if (!fs.existsSync(logPath)) return api.sendMessage('No error log found.', event.threadID);
    const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n');
    const last10 = lines.slice(-10).map((l, i) => `${i+1}. ${truncate(l, 300)}`).join('\n');
    api.sendMessage(`🛑 Last 10 errors:\n${last10}`, event.threadID);
  }
};
