# Nexus Bot Documentation

Welcome to the official documentation for Nexus Bot! This guide will help you quickly set up, configure, and extend your Nexus Bot with confidence.

## 📦 Table of Contents
- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [Configuration Guide](#configuration-guide)
- [Commands System](#commands-system)
- [Events System](#events-system)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Add Facebook credentials:**
   - Place your `appstate.json` in the project root.
3. **Configure the bot:**
   - Edit `config.json` (see [Configuration Guide](#configuration-guide)).
4. **Start Nexus Bot:**
   ```bash
   npm start
   ```

---

## 🏗️ Architecture Overview

Nexus Bot is designed for modularity and performance. Key components:
- **nexus-core/**: Core logic, command/event handling, database, utils
- **commands/**: All bot commands
- **events/**: Event handlers
- **database/**: SQLite DB, backups, temp
- **docs/**: Documentation
- **logs/**: Log files
- **temp/**: Temporary files
- **Fca_Database/**: (Optional) FCA database
- **config.json**: Main config
- **index.js**: Main entry point
- **package.json**: Node.js dependencies and scripts

**Optimizations include:**
- Smart memory management
- Command queueing
- Auto-recovery on errors
- Fast configuration caching

---

## 🌟 Advanced Features

- **Auto-Recovery:** Automatic restart on errors or high memory usage
- **Memory Management:** Proactive monitoring and cleanup
- **Hot Reloading:** Instantly reload commands on file changes
- **Role-Based Permissions:** Fine-grained access control
- **GitHub Sync:** Optional data backup to GitHub

For details, see the dedicated docs for each feature.

# nexus-fca Troubleshooting & Tips

// This document is obsolete after migration to nexus-fca. Please refer to the new API docs for nexus-fca usage and troubleshooting.
// ## Nexus fca can be found on [npm](https://www.npmjs.com/package/nexus-fca) and [GitHub](https://github.com/Nexus-016/Nexus-fCA)

