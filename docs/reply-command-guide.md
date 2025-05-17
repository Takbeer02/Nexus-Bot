# Guide to Reply-Based Commands

Reply commands let you create interactive, multi-step conversations with users. This guide shows how to build and manage them in Nexus Bot.

---

## 🏗️ Basic Structure
```js
module.exports = {
  config: { name: "mycommand", ... },
  async execute({ api, event }) {
    const reply = await api.sendMessage("First question?", event.threadID);
    global.client.handleReply.push({
      name: this.config.name,
      messageID: reply.messageID,
      author: event.senderID,
      type: "step_1",
      data: {}
    });
  },
  async handleReply({ api, event, handleReply }) {
    if (event.senderID !== handleReply.author) return;
    switch(handleReply.type) {
      case "step_1":
        // Handle first reply, then push next step
        break;
      case "step_2":
        // Handle second reply, finish
        break;
    }
  }
};
```

---

## 🔑 Key Concepts
- Register reply handlers with `global.client.handleReply.push()`
- Use `type` to track conversation steps
- Store data in `data` for multi-step flows
- Always check `senderID !== handleReply.author` for security

---

## 💡 Usage Example
1. User calls the command (e.g., `!mycommand`)
2. Bot sends a question
3. User replies; bot processes and may ask another question
4. After all steps, bot sends the result

---

## ✅ Best Practices
- Use `countDown` to prevent spam
- Set appropriate `role` for permissions
- Document each step and expected input
- Use try/catch for error handling
- Clean up handlers after use
- Implement timeouts for inactive conversations

---

## 🚀 Advanced Tips
- Combine with `handleReaction` for interactive flows
- Validate all user input
- Track state for multi-step forms
- Give clear instructions and error messages

---

**Common Patterns:**
- Multi-step forms
- Confirmation flows
- Data collection with progress

**Remember:** Always clean up handlers and handle errors to keep your bot stable and user-friendly!
