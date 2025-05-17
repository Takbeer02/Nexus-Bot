# Performance Optimization Guide

Nexus Bot is designed for high performance, even in busy groups. This guide explains how the system stays fast and reliable, and how you can tune it for your needs.

---

## 🧠 Memory Management
- **Automatic monitoring:** The bot checks memory usage and triggers cleanup or restart if needed.
- **Garbage collection:** Enabled with Node.js `--expose-gc` flag.
- **Configurable thresholds:** Set in `config.json` under `system.autoRestart.memoryThreshold`.

---

## ⏳ Command Queueing
Commands are processed through a queue to prevent API overload and rate limiting:
```js
static queueCommand(handler, api, message) {
  this.commandQueue.push({ handler, api, message });
  if (!this.isProcessing) this.processQueue();
}
```
**Benefits:**
- Prevents Facebook API rate limits
- Improves reliability
- Allows for better error handling

---

## ⚠️ Error Rate Monitoring
The bot tracks errors and can auto-restart if too many occur:
```js
if (this.errorCount >= maxErrors) {
  global.AutoRecovery.initiateRestart('error-threshold', `${this.errorCount} errors triggered auto-restart`);
}
```

---

## 🗃️ Cache Management
- Frequently accessed data is cached for speed
- Caches auto-expire and are cleaned up regularly
- Caches are flushed if memory usage is high

---

## 💬 Message Handling Optimization
- Typing indicators are rate-limited
- Read receipts are batched
- Events are processed efficiently

---

## 🛠️ Troubleshooting Performance
- Check logs for memory or error warnings
- Adjust memory threshold in `config.json`
- Increase error tolerance if needed
- Disable typing indicators if rate-limited
- Use a machine with more resources for heavy use

**Tip:** Set `"logLevel": "debug"` in your config for detailed performance logs.
