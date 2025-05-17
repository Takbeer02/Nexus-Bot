# Configuration Guide

Nexus Bot uses a single `config.json` file to control all major settings. This guide explains each section and how to customize your bot.

---

## 📁 File Location
- Main config file: `/config.json`

---

## 🗂️ Structure Overview
```json
{
  "name": "NexusBot",
  "version": "1.0.0",
  "prefix": "!",
  "language": "en",
  "timezone": "UTC",
  "logLevel": "info",
  "admins": ["YOUR_FACEBOOK_ID"],
  "permissions": { ... },
  "system": { ... },
  "behavior": { ... },
  "safety": { ... },
  "database": { ... },
  "github": { ... }
}
```

---

## 🔑 Core Options
| Option      | Description           | Default      |
|-------------|-----------------------|--------------|
| `name`      | Bot name              | NexusBot     |
| `version`   | Bot version           | 1.0.0        |
| `prefix`    | Command prefix        | !            |
| `language`  | Bot language          | en           |
| `timezone`  | Time zone             | UTC          |
| `logLevel`  | Logging level         | info         |
| `admins`    | Admin Facebook IDs    | []           |

---

## 🛡️ Permissions
```json
"permissions": {
  "owner": "YOUR_FACEBOOK_ID",
  "superAdmins": []
}
```

---

## ⚙️ System
- `autoRestart`: Controls auto-recovery and memory management
- `performance`: Caching, concurrency, and cleanup settings

---

## 🤖 Behavior
- `typing`: Typing simulation options
- `activeHours`: When the bot is active

---

## 🗄️ Database
- `backup`: Enable/disable backups, interval, retention
- `path`: Database file location

---

## 🌐 GitHub
- `enabled`, `owner`, `repo`, `branch`, `autoSync`, `syncInterval`, `backupRetention`

---

**Tip:** For most users, only `prefix`, `admins`, and `autoRestart` need to be changed. Advanced users can fine-tune every aspect of the bot here.
