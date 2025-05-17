// Example advanced event handler using new event system patterns
module.exports = {
  config: {
    name: "exampleAdvancedEvent",
    version: "1.0.0",
    description: "Demonstrates onChat, onReply, onReaction, and role config",
    role: 1 // Only group admins and above
  },
  onChat: async function({ api, event }) {
    if (event.body && event.body.toLowerCase() === "hello bot") {
      api.sendMessage("👋 Hello! This is an onChat event.", event.threadID);
    }
  },
  onReply: async function({ api, event }) {
    api.sendMessage("You replied to a message! (Handled by onReply)", event.threadID);
  },
  onReaction: async function({ api, event }) {
    api.sendMessage(`You reacted with ${event.reaction}. (Handled by onReaction)`, event.threadID);
  },
  execute: async function({ api, event }) {
    // Fallback for any other event types
  }
};
