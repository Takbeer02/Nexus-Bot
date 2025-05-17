# Event System Guide

Nexus Bot's event system lets you respond to Messenger events like messages, joins, leaves, and more. This guide explains how to create and use event handlers.

---

## 📝 Event Handler Structure
Each event handler is a JS file in the `events` directory. You can use advanced handler patterns:
```js
module.exports = {
  config: {
    name: "eventName",
    version: "1.0.0",
    description: "Handles a specific event",
    role: 1 // (optional) Minimum role required to trigger this event handler
  },
  // Advanced event handler patterns (all optional):
  onChat: async function({ api, event, config }) {
    // Handle normal chat messages
  },
  onReply: async function({ api, event, config }) {
    // Handle replies to messages
  },
  onReaction: async function({ api, event, config }) {
    // Handle message reactions
  },
  execute: async function({ api, event, config }) {
    // Fallback handler (runs for all events if above are not matched)
  }
};
```

---

## 🚦 Event Types
| Event Type         | Description                      |
|--------------------|----------------------------------|
| `message`          | A regular message                |
| `message_reply`    | A reply to a message             |
| `message_reaction` | A reaction to a message          |
| `add_participants` | New members added to a group     |
| `remove_participant`| Member removed from a group      |
| `log:thread-name`  | Group name was changed           |
| `log:unsubscribe`  | User left the group              |
| `log:subscribe`    | User joined the group            |
| `log:nickname`     | Nickname was changed             |
| `reaction`         | Message reaction added/removed   |

---

## 💡 Example: Advanced Event Handler
```js
module.exports = {
  config: {
    name: "myEvent",
    description: "Example advanced event handler",
    role: 2 // Only bot admins and above
  },
  onChat: async function({ api, event }) {
    if (event.body && event.body.toLowerCase() === "ping") {
      api.sendMessage("Pong! (from onChat)", event.threadID);
    }
  },
  onReply: async function({ api, event }) {
    api.sendMessage("You replied to a message! (from onReply)", event.threadID);
  },
  onReaction: async function({ api, event }) {
    api.sendMessage(`You reacted with ${event.reaction}. (from onReaction)`, event.threadID);
  },
  execute: async function({ api, event }) {
    // Fallback for any other event types
  }
};
```

---

## ✅ Best Practices
- Use early returns to skip irrelevant events
- Always check event type before processing
- Use try/catch to prevent crashes
- Use proper log levels
- Keep handlers lightweight
- Debounce or rate-limit frequent events

---

## 🏗️ System Architecture
1. Events are received from Facebook API
2. The core handler (`eventHandler.js`) processes each event
3. Each registered handler's matching method (`onChat`, `onReply`, etc.) runs independently

This lets you process the same event in multiple ways, safely and efficiently.
