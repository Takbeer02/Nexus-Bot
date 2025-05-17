# Auto-Recovery System

Nexus Bot features a robust auto-recovery system to keep your bot running smoothly—even in the face of errors or high memory usage.

---

## 🚦 Key Features
- **Memory Monitoring:** Restarts the bot if memory usage exceeds your configured threshold.
- **Error Tracking:** Automatically restarts after too many errors in a short period.
- **Scheduled Restarts:** Optionally restart the bot at regular intervals for long-term stability.
- **Safe Shutdown:** Graceful restarts to prevent data loss.
- **Recovery Markers:** Tracks restart reasons for diagnostics.

---

## ⚙️ How It Works

### Memory-Based Recovery
If memory usage (RSS) exceeds your configured limit, the bot will restart automatically:
```js
if (rssMB > threshold) {
  global.AutoRecovery.initiateRestart('memory-limit', `Memory usage (${rssMB}MB) exceeded threshold (${threshold}MB)`);
}
```

### Error-Based Recovery
If too many errors occur in a short time, the bot restarts:
```js
if (this.errorCount >= maxErrors) {
  global.AutoRecovery.initiateRestart('error-threshold', `${this.errorCount} errors triggered auto-restart`);
}
```

### Scheduled Recovery
You can schedule periodic restarts:
```js
if (autoRestartConfig?.enabled && autoRestartConfig?.interval) {
  setInterval(() => {
    this.initiateRestart('scheduled', 'Periodic scheduled restart');
  }, autoRestartConfig.interval);
}
```

---

## 🔄 Restart Process
1. A marker file is created with restart details
2. Pre-restart tasks (cache clear, optional DB backup) run
3. Admins are notified with reason and details
4. The process exits and is restarted by your process manager
5. On startup, the bot detects the marker and sends a recovery notification

---

## 🛠️ Configuration Example
Set your preferences in `config.json`:
```json
"system": {
  "autoRestart": {
    "enabled": true,
    "memoryThreshold": 500,
    "interval": 21600000,
    "type": "soft",
    "refreshConnection": true,
    "reloadPermissions": true,
    "clearCache": true,
    "backupDatabase": false,
    "timeout": 3000,
    "autoRestartOnError": true,
    "maxErrorsBeforeRestart": 20,
    "errorResetInterval": 3600000
  }
}
```

---

## 📢 Notifications
Admins are notified before and after restarts, including downtime and reason.

---

## ✅ Best Practices
- Set realistic memory and error thresholds
- Schedule restarts during low-traffic hours
- Monitor restart frequency—frequent restarts may signal deeper issues
- Use database backup with caution (adds restart time)

---

## 🧰 Troubleshooting
- Check logs for auto-recovery errors
- Ensure your process manager is set to restart the bot
- Verify file permissions for marker files
- Test manual restarts to confirm setup
- Make sure admin IDs are correct for notifications
