const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "cmds", "commands"],
    version: "1.1.0",
    author: "NexusTeam",
    countDown: 5,
    role: 0,
    shortDescription: "Display available commands",
    longDescription: "Show all available commands or detailed information about a specific command",
    category: "system",
    guide: "{prefix}help [command]"
  },
  
  execute: async function({ api, event, args, commands, prefix }) {
    try {
      const { threadID } = event;
      
      if (args[0]) {
        // Show detailed help for a specific command
        const cmd = [...commands.values()].find(c => c.config.name === args[0] || (c.config.aliases && c.config.aliases.includes(args[0])));
        if (!cmd) return api.sendMessage('❌ Command not found.', event.threadID);
        const c = cmd.config;
        return api.sendMessage(`ℹ️ ${c.name}\n${c.longDescription || c.shortDescription}\nUsage: ${c.guide.replace(/{prefix}/g, prefix)}`, event.threadID);
      }
      
      // Group commands by category
      const cats = {};
      for (const cmd of commands.values()) {
        const cat = cmd.config.category || 'other';
        if (!cats[cat]) cats[cat] = [];
        cats[cat].push(cmd.config.name);
      }
      
      let msg = '📖 Command List:\n';
      for (const [cat, cmds] of Object.entries(cats)) {
        msg += `\n[${cat}]\n- ${cmds.join(', ')}\n`;
      }
      msg += `\nType ${prefix}help [command] for details.`;
      api.sendMessage(msg, event.threadID);
    } catch (error) {
      console.error("Help command error:", error);
      return api.sendMessage("❌ An error occurred while processing the help command.", event.threadID);
    }
  }
};

// Helper function to get total commands for permission level
function getCommandsForPermissionLevel(commands, level) {
  let count = 0;
  commands.forEach(cmd => {
    if (cmd.config.role <= level) count++;
  });
  return count;
}

// Helper function to get emoji for category
function getCategoryEmoji(category) {
  const emojis = {
    'admin': '⚙️',
    'fun': '🎮',
    'game': '🎲',
    'group': '👥',
    'image': '🖼️',
    'media': '📷',
    'moderation': '🛡️',
    'money': '💰',
    'owner': '👑',
    'system': '🤖',
    'tool': '🔧',
    'utility': '🛠️',
    'uncategorized': '📁'
  };
  
  return emojis[category] || '📁';
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
