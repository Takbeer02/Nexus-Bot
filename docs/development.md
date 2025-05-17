# Development Guide

This guide will help you set up a development environment, follow best practices, and contribute to Nexus Bot efficiently.

---

## 🛠️ Environment Setup
- **Node.js** >= 18.0.0
- **Git**
- **VS Code** (recommended)
- **Facebook test account**

### Install & Start
```powershell
# Clone repository
git clone https://github.com/Nexus-016/nexus-bot.git
cd nexus-bot

# Install dependencies
npm install

# Start in development mode
npm run dev
```

---

## 🗂️ Project Structure
```
Nexus/
├── appstate.json           # Facebook appstate (login credentials)
├── config.json             # Main config
├── package.json            # Node.js dependencies and scripts
├── index.js                # Main entry point
├── commands/               # Command modules
├── events/                 # Event handlers
├── nexus-core/             # Core logic, database, utils, etc.
├── database/               # SQLite DB, backups, temp
├── docs/                   # Documentation
├── logs/                   # Log files
├── temp/                   # Temporary files
├── Fca_Database/           # (Optional) FCA database
└── ... (other folders/files as needed)
```

---

## ✨ Code Style
- Use camelCase for variables/functions
- Use PascalCase for classes
- Use meaningful names
- Add comments for complex logic
- Follow ESLint rules
- Prefer async/await
- **Commands:** Always use `run` (not `execute`) and a single context object: `run: async function({ api, event, args, ... })`

---

## 🧪 Testing & Debugging
- **Run tests:**
  ```powershell
  npm test
  ```
- **Lint code:**
  ```powershell
  npm run lint
  npm run lint:fix
  ```

---

## 🆕 Command Example (Goat-Bot-V2 Style)
```js
module.exports = {
  config: {
    name: "ping",
    shortDescription: "Check latency",
    guide: "{prefix}ping"
  },
  run: async function({ api, event }) {
    const start = Date.now();
    api.sendMessage("Pong!", event.threadID, () => {
      api.sendMessage(`Latency: ${Date.now() - start}ms`, event.threadID);
    });
  }
};
```

---

## 🆕 Advanced Handler Permissions
You can set granular permissions for each handler in a command:
```js
role: {
  run: 2,         // Only bot admins and above can use the command
  onChat: 0,      // Everyone can trigger onChat
  onReply: 1,     // Only group admins and above can trigger onReply
  onReaction: 0   // Everyone can trigger onReaction
}
```
If you use a number for `role`, it applies to all handlers. If you use an object, you can set each handler's required role separately.

---

## 🆕 Supported Event Handler Methods
You can use the following methods in your event handler files (in `/events`):
- `execute`: Main handler, called for all events if no specific handler matches
- `onChat`: Called for every normal message (type: 'message')
- `onReply`: Called for reply events (type: 'message_reply')
- `onReaction`: Called for message reaction events (type: 'message_reaction')
- (You can add more custom handlers as needed)

Example:
```js
module.exports = {
  config: { name: "myEvent", ... },
  onChat: async function({ api, event }) { /* ... */ },
  onReply: async function({ api, event }) { /* ... */ },
  onReaction: async function({ api, event }) { /* ... */ },
  execute: async function({ api, event }) { /* fallback for any event */ }
};
```
- The system will automatically call the right handler for each event type.
- You can use all or just some of these methods in your event files.

---

## 🗂️ All Messenger Event Types
You can handle these Messenger event types in your event handler files:

| Event Type            | Description                                 |
|---------------------- |---------------------------------------------|
| `message`             | A regular message                           |
| `message_reply`       | A reply to a message                        |
| `message_reaction`    | A reaction to a message                     |
| `event`               | Group events (add/remove, name change, etc) |
| `add_participants`    | New members added to a group                |
| `remove_participant`  | Member removed from a group                 |
| `log:thread-name`     | Group name was changed                      |
| `log:unsubscribe`     | User left the group                         |
| `log:subscribe`       | User joined the group                       |
| `log:nickname`        | Nickname was changed                        |
| `log:thread-icon`     | Group icon was changed                      |
| `log:thread-color`    | Group color/theme was changed               |
| `log:thread-call`     | Group call started/ended                    |
| `message_unsend`      | Message was unsent                          |
| ...                   | (Other Messenger event types as needed)     |

You can use the `event.type` and related fields in your handler to filter and process these events as needed.

---

## 🆕 Shared Database Sync Utility
Use `ensureDbEntities(api, event)` from `nexus-core/dbSync.js` to make sure user and thread exist in the database before processing. This is now used in all major event/command entrypoints for safety.

---

## 🆕 New Utilities
- `convertTime(ms)`: Format milliseconds as a human-readable string (e.g. 1d2h3m4s)
- `normalizeString(str)`: Remove accents, lowercase, and trim a string

---

## 🧑‍💻 Contributing
- Fork the repo, make changes, and submit a pull request.
- Follow the command structure and code style above.
- Update documentation if you add new features or commands.
