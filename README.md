<!-- Nexus Bot Banner -->
<p align="center">
  <img src="https://i.ibb.co/B5NKmCNJ/Fashion-Brand-Etsy-Banner.png" alt="Nexus Bot Banner" width="800" height="200"/>
</p>

<p align="center">
  <b>Nexus Bot - Ignition X</b><br>
  <i>Fast. Safe. Professional. The next generation Facebook Messenger bot platform.</i>
</p>

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E=16.0.0-green?style=flat-square&logo=node.js" alt="Node.js"/></a>
  <a href="https://github.com/Nexus-016/Nexus-Bot/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Nexus-016/Nexus-Bot?style=flat-square" alt="License"/></a>
  <a href="https://github.com/Nexus-016/Nexus-Bot/stargazers"><img src="https://img.shields.io/github/stars/Nexus-016/Nexus-Bot?style=flat-square" alt="Stars"/></a>
  <a href="https://github.com/Nexus-016/Nexus-Bot/issues"><img src="https://img.shields.io/github/issues/Nexus-016/Nexus-Bot?style=flat-square" alt="Issues"/></a>
</p>

---

# Nexus Bot - Ignition X

A modern, advanced, and safe Facebook Messenger bot platform. Built for speed, reliability, and easy customization.

---

## ✨ Why Nexus?
- **Uses its own Facebook API library:** [Nexus-fCA](https://www.npmjs.com/package/nexus-fca) — no hidden privacy risks, no data stealing, no shady dependencies.
- **Privacy First:** No credential or message stealing. Your data stays on your server, always.
- **Secure by Design:** Robust permission system, sensitive files ignored, and auto-recovery.
- **Easy to Extend:** Clean codebase, full documentation, and simple config.
- **Open Source & Transparent:** All code is public, no obfuscation, no spyware.

---

## 🚀 Features
- Advanced command/event handler (onChat, onReply, onReaction, per-role)
- SQLite database, auto-syncs users/threads/admins on group changes
- Auto-recovery, memory monitoring, and error notifications
- Customizable prefix, hot-reload, and modular structure
- Full documentation in `/docs`

---

## 📦 Project Structure
```text
Nexus/
├── commands/         # All bot commands (modular)
├── events/           # All event handlers (group, message, etc.)
├── nexus-core/       # Core logic, database, utils, handlers
├── database/         # SQLite DB, backups, temp
├── logs/             # Log files (info, error, debug)
├── docs/             # Documentation
├── assets/           # Fonts, images, etc.
├── config.json       # Main configuration
├── index.js          # Bot entry point
└── ...
```

---

## ⚡ Quick Start
1. **Install Node.js** (v16+ recommended)
2. **Clone the repo:**
   ```powershell
   git clone https://github.com/Nexus-016/Nexus-Bot.git
   cd Nexus-Bot
   ```
3. **Install dependencies:**
   ```powershell
   npm install
   ```
4. **Configure:**
   - Edit `config.json` with your bot settings and Facebook credentials.
   - Place your `appstate.json` in the root folder (for Facebook login).
5. **Run the bot:**
   ```powershell
   node index.js
   ```

---

## 🛠️ Adding Commands & Events
- Add new command files to `commands/` (see `commands/example.js.txt` for a template).
- Add new event files to `events/` (see `events/exampleAdvancedEvent.js`).
- Hot-reload supported: changes are picked up automatically.

---

## 🗄️ Database
- Uses SQLite (`database/data.db`) for all data.
- Syncs users, threads, and admins only when group membership changes (join/leave/admin update).
- No slow batch sync at startup.
- See `docs/database.md` for schema and advanced usage.

---

## 🔒 Security & Permissions
- Owner and admins set in `config.json`.
- Per-command and per-event role control.
- Sensitive files (`appstate.json`, `fb_dtsg_data.json`, etc.) are ignored by git.
- Error notifications sent to admins.

---

## 📚 Documentation
- See the `docs/` folder for:
  - Command & event guides
  - Configuration & security
  - Development best practices
  - Update logs

---

## 👥 Credits
- **NexusTeam** - Core development
- **Nexus-fCA** - Facebook API

---

## 📝 License
MIT License. See `LICENSE` for details.

---

## 💬 Support & Community
- [GitHub Issues](https://github.com/Nexus-016/Nexus-Bot/issues)
- [Docs & Guides](./docs/)

---

> Nexus Bot - Ignition X | Fast. Safe. Professional.
