# Configuration Quick Reference

This guide summarizes the most important configuration options for Nexus Bot. For full details, see `docs/configuration.md`.

---

## 🔧 Basic Settings
| Setting         | Description                | Default      |
|-----------------|----------------------------|--------------|
| `botName`       | Name of the bot            | NexusBot     |
| `prefix`        | Command prefix             | !            |
| `botAdminUID`   | Admin user ID              | (your UID)   |

---

## 🛡️ Safe Mode
- `enabled`: Enable/disable safe mode
- `maxDailyMessages`: Max messages per day (default: 1000)
- `minMessageInterval`: Minimum delay between messages (ms)
- `maxMessageInterval`: Maximum delay between messages (ms)
- `contentFilter`: Filtered content types (e.g. spam, abuse)

---

## 🤖 Bot Behavior
- **Typing Simulation:**
  - `enabled`, `minSpeed`, `maxSpeed`
- **Active Hours:**
  - `start`, `end` (24h format)
- **Auto Breaks:**
  - `enabled`, `minDuration`, `maxDuration`

---

## 🗄️ Database
- `backupEnabled`: Enable automatic backups
- `backupInterval`: Backup interval (ms)

---

## 🔨 Moderation
- `enabled`: Enable moderation features
- `maxWarns`: Max warnings before action
- `bannedWords`: List of banned words
- `spamProtection`: Enable spam protection

---

## 🌐 GitHub Integration
- `enabled`: Enable GitHub sync
- `owner`, `repo`, `branch`, `autoSync`, `syncInterval`, `backupRetention`

---

**Tip:** Edit `config.json` to customize these settings. For advanced options, see the full configuration guide.
