module.exports = {
  config: {
    name: "feature-toggle",
    version: "1.0.0",
    author: "NexusTeam",
    countDown: 5,
    role: 2, // Admin-level command
    shortDescription: "Manage feature toggles",
    longDescription: "Enable or disable various bot features and functionality",
    category: "system",
    guide: "{prefix}feature-toggle list\n{prefix}feature-toggle <feature-name> <enable|disable>",
    aliases: ["toggle", "features"]
  },
  
  execute: async function ({ api, event, args }) {
    const availableFeatures = [
      { key: 'antiSpam', desc: 'Anti-spam protection' },
      { key: 'autoModeration', desc: 'Automatic moderation' },
      { key: 'analytics', desc: 'Usage analytics' },
      { key: 'commandCooldowns', desc: 'Command cooldowns' },
      { key: 'eventLogging', desc: 'Event logging' },
      { key: 'typingIndicator', desc: 'Typing indicator' },
      { key: 'autoRecovery', desc: 'Auto-recovery on crash/memory' },
      { key: 'githubSync', desc: 'GitHub data sync' }
    ];

    global.features = global.features || {};

    // Show all features and their status if no args or only 1 arg
    if (!args[0] || args[0] === 'list') {
      const featureList = availableFeatures.map(f => {
        const status = global.features[f.key] ? '🟢 enabled' : '🔴 disabled';
        return `• ${f.key.padEnd(16)} ${status}  —  ${f.desc}`;
      }).join('\n');
      // Add a detailed panel with legend and usage instructions
      return api.sendMessage(
        `Feature Toggle Panel\n----------------------\n\nLegend: 🟢 = enabled, 🔴 = disabled\n\n${featureList}\n\nTo enable:   {prefix}feature-toggle <feature-name> enable\nTo disable:  {prefix}feature-toggle <feature-name> disable\n\nExample:\n  !feature-toggle analytics enable\n  !feature-toggle autoModeration disable\n`,
        event.threadID
      );
    }

    // Toggle a feature
    const featureName = args[0];
    const action = args[1] && args[1].toLowerCase();
    const featureObj = availableFeatures.find(f => f.key === featureName);
    if (!featureObj) {
      return api.sendMessage(
        `Unknown feature: "${featureName}".\nType {prefix}feature-toggle or {prefix}feature-toggle list to see all features.`,
        event.threadID
      );
    }
    if (!['enable', 'disable'].includes(action)) {
      return api.sendMessage(
        `Invalid action. Usage: {prefix}feature-toggle <feature-name> <enable|disable>`,
        event.threadID
      );
    }
    global.features[featureName] = action === 'enable';
    return api.sendMessage(
      `Feature "${featureName}" is now ${action === 'enable' ? '🟢 enabled' : '🔴 disabled'}.\n(${featureObj.desc})`,
      event.threadID
    );
  }
};