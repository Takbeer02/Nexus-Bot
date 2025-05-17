# Nexus Bot API Guide

This document provides a clear, practical overview of the APIs available in Nexus Bot, including both the Facebook Messenger API (nexus-fca) and Nexus-specific extensions.

---

## Table of Contents
1. [Messenger API (nexus-fca)](#messenger-api-nexus-fca)
2. [Nexus Custom APIs](#nexus-custom-apis)
3. [Common Use Cases](#common-use-cases)

---

## 1. Messenger API (nexus-fca)

Nexus Bot uses [nexus-fca](https://www.npmjs.com/package/nexus-fca) to interact with Facebook Messenger. Here are the most common methods:

### Message Functions
- **Send a message:**
  ```js
  api.sendMessage("Hello!", threadID);
  ```
- **Send attachments:**
  ```js
  api.sendMessage({ attachment: fs.createReadStream('file.jpg') }, threadID);
  ```
- **Show typing indicator:**
  ```js
  api.sendTypingIndicator(threadID);
  ```
- **React to a message:**
  ```js
  api.setMessageReaction("😍", messageID);
  ```

### Thread & User Management
- **Get thread info:**
  ```js
  api.getThreadInfo(threadID, callback);
  ```
- **Add/remove user:**
  ```js
  api.addUserToGroup(userID, threadID);
  api.removeUserFromGroup(userID, threadID);
  ```
- **Get user info:**
  ```js
  api.getUserInfo(userIDs, callback);
  ```
- **Get current user ID:**
  ```js
  api.getCurrentUserID();
  ```

### Event Listening
- **Listen for events:**
  ```js
  api.listenMqtt((err, event) => {
    if (event.type === "message") {
      // handle message
    }
  });
  ```

---

## 2. Nexus Custom APIs

Nexus Bot extends nexus-fca with safe wrappers, database access, permission management, and optimization tools.

### Safe API Wrappers
- **Safe send typing indicator:**
  ```js
  const safeApi = require('../utils/apiHelpers');
  await safeApi.sendTypingIndicator(api, threadID);
  ```
- **Safe send message:**
  ```js
  await safeApi.sendMessage(api, "Hello", threadID);
  ```

### Database API
- **Get user:**
  ```js
  const dbManager = require('../nexus-core/dbManager');
  const user = await dbManager.getUser(userID);
  ```
- **Update XP or money:**
  ```js
  await dbManager.updateExp(userID, 10);
  await dbManager.updateMoney(userID, 100);
  ```

### Permission System
- **Get/set user role:**
  ```js
  const role = await global.permissionManager.getUserRole(userID);
  await global.permissionManager.setUserRole(userID, 2); // 2 = bot admin
  ```
- **Check thread admin:**
  ```js
  const isAdmin = await global.permissionManager.isThreadAdmin(api, userID, threadID);
  ```

### Optimization Utilities
- **Track errors:**
  ```js
  const Optimization = require('../nexus-core/optimization');
  Optimization.trackError(error);
  ```
- **Clear memory:**
  ```js
  Optimization.clearMemory();
  ```

### Configuration Management
- **Get/update config:**
  ```js
  const configLoader = require('../nexus-core/configLoader');
  const prefix = configLoader.get('prefix', '!');
  configLoader.update({ prefix: '/' });
  ```

---

## 3. Common Use Cases

### Command Example
```js
// /commands/hello.js
module.exports = {
  config: {
    name: "hello",
    aliases: ["hi"],
    guide: "{prefix}hello [name]"
  },
  execute: async function({ api, event, args }) {
    const name = args[0] || "friend";
    return api.sendMessage(`Hello, ${name}!`, event.threadID);
  }
};
```

### Event Handler Example
```js
// /events/welcome.js
module.exports = {
  config: { name: "welcome" },
  execute: async function({ api, event }) {
    if (event.type === "add_participants") {
      api.sendMessage("Welcome!", event.threadID);
    }
  }
};
```

### Admin Operation Example
```js
// Ban a user
await api.removeUserFromGroup(userID, threadID);
await dbManager.banUser(userID, "Spamming");
```

---

**Tip:** Always use try/catch for API calls to handle errors gracefully and keep your bot running smoothly.
