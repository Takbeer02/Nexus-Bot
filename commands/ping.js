// filepath: commands/ping.js
// Simple ping command to check bot responsiveness

module.exports = {
  config: {
    name: "ping",
    aliases: ["latency"],
    version: "1.0.0",
    author: "NexusTeam",
    countDown: 2,
    role: 0,
    shortDescription: "Check bot latency",
    longDescription: "Check if the bot is online and measure response time.",
    category: "info",
    guide: "{prefix}ping"
  },
  async execute({ api, event }) {
    const start = Date.now();
    api.sendMessage("🏓 Pong!", event.threadID, () => {
      const latency = Date.now() - start;
      api.sendMessage(`⏱️ Latency: ${latency}ms`, event.threadID);
    });
  }
};
