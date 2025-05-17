# Command Development Guide

This guide explains how to create, structure, and manage commands for Nexus Bot in a clear and professional way.

---

## 📝 Command File Structure
Each command is a JavaScript file in the `commands` directory. Example:
```js
module.exports = {
  config: {
    name: "hello",
    aliases: ["hi"],
    version: "1.0.0",
    author: "YourName",
    countDown: 5,
    role: 0, // 0=everyone, 1=group admin, 2=bot admin, 3=owner
    shortDescription: "Say hello",
    longDescription: "A friendly greeting command",
    category: "general",
    guide: "{prefix}hello [name]"
  },
  run: async function({ api, event, args }) {
    const name = args[0] || "friend";
    return api.sendMessage(`Hello, ${name}!`, event.threadID);
  }
};
```

---

## 🆕 Advanced Command Handler Patterns
You can now add these optional methods to your command files:
- `onChat`: Runs for every normal message (not just commands)
- `onReply`: Runs when a user replies to a message sent by this command
- `onReaction`: Runs when a user reacts to a message sent by this command

You can also set granular permissions for each handler type:
```js
module.exports = {
  config: {
    name: "example",
    // ...existing config fields...
    role: {
      run: 2,         // Only bot admins and above can use the command
      onChat: 0,      // Everyone can trigger onChat
      onReply: 1,     // Only group admins and above can trigger onReply
      onReaction: 0   // Everyone can trigger onReaction
    }
  },
  run: async function({ api, event, args }) {
    // Usual command logic
  },
  onChat: async function({ api, event }) {
    // Handle all normal messages (not just commands)
  },
  onReply: async function({ api, event, handleReply }) {
    // Handle replies to this command's messages
  },
  onReaction: async function({ api, event, handleReaction }) {
    // Handle reactions to this command's messages
  }
};
```
- If you use a number for `role`, it applies to all handlers. If you use an object, you can set each handler's required role separately.
- These methods are optional. If present, the system will call them automatically for the right event type.
- Use `handleReply` and `handleReaction` params to access context for multi-step flows.

---

## ⚙️ Command Configuration
| Property         | Description                        | Required |
|------------------|------------------------------------|----------|
| `name`           | Command name                       | Yes      |
| `aliases`        | Alternative names                  | No       |
| `version`        | Command version                    | No       |
| `author`         | Command creator                    | No       |
| `countDown`      | Cooldown in seconds                | No (3)   |
| `role`           | Permission level (0-3) or object   | No (0)   |
| `shortDescription`| Brief description                 | No       |
| `longDescription`| Detailed description               | No       |
| `category`       | Command category                   | No       |
| `guide`          | Usage instructions                 | No       |

**Permission Roles:**
- `0`: Everyone
- `1`: Group admins
- `2`: Bot admins
- `3`: Bot owner only

---

## 🚦 Command Execution
The `run` function is called when the command is triggered. It receives:
- `api`: Facebook API interface
- `event`: Message event
- `args`: Command arguments
- `commands`: Map of all commands
- `prefix`: Command prefix

---

## 💡 Example Commands

### Simple Command
```js
module.exports = {
  config: { name: "ping", shortDescription: "Check if the bot is responding", category: "system" },
  run: async function({ api, event }) {
    api.sendMessage("Pong! 🏓", event.threadID);
  }
};
```

### Command with Arguments
```js
module.exports = {
  config: { name: "echo", shortDescription: "Repeat a message", guide: "{prefix}echo [message]", category: "utility" },
  run: async function({ api, event, args }) {
    const message = args.join(" ");
    if (!message) return api.sendMessage("Please provide a message to echo.", event.threadID);
    api.sendMessage(`You said: ${message}`, event.threadID);
  }
};
```

### Command with Permissions
```js
module.exports = {
  config: { name: "ban", role: 2, shortDescription: "Ban a user", guide: "{prefix}ban [userID] [reason]", category: "admin" },
  run: async function({ api, event, args }) {
    const userID = args[0];
    const reason = args.slice(1).join(" ") || "No reason provided";
    if (!userID) return api.sendMessage("Please provide a user ID to ban.", event.threadID);
    api.sendMessage(`Banned user ${userID}. Reason: ${reason}`, event.threadID);
  }
};
```

---

## 🆕 Best Practices
- Always use `run` instead of `execute` for the main function.
- Use a single context object for all arguments: `{ api, event, args, ... }`.
- Keep command files simple and beginner-friendly.
- Add a `guide` field for auto-generated help.
- Use clear, consistent naming for all commands.

---

## 🛠️ Migrating Old Commands
If you have commands using `execute`, just rename it to `run` and update your command loader to use `run`.
