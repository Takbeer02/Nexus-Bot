# Nexus Bot Update Log

> **Current Version:** 1.2.0  
> **Codename:** Ignition X

This document tracks major updates, new features, improvements, and important changes to the Nexus Bot project.

---

## 🆕 Recent Updates (2025)

### Project Structure & Documentation
- Project structure in all docs now matches the real folder layout (`nexus-core/`, `logs/`, `temp/`, etc.).
- Updated all documentation for new command/event system, advanced handler patterns, and best practices.

### Command System
- All commands migrated to `{ config, run }` structure.
- Added support for `onChat`, `onReply`, `onReaction` in commands (with per-handler role config).
- Improved command loader for hot-reloading and granular permissions.
- Added new admin commands: `resync`, `stats`, `ping`, `reload`, `errors`.

### Event System
- Modular event handler system with support for `onChat`, `onReply`, `onReaction`, and per-event role config.
- Added new events: `autoUptime` (periodic ping to keep bot alive), `adminNoti`, `introMessage`, `groupEvent`, `exampleAdvancedEvent`.
- Improved error handling and admin notifications for all critical errors.

### Utilities & Core
- Added advanced time formatting and string normalization utilities.
- Shared database sync utility (`ensureDbEntities`) for safe user/thread creation.
- Improved logging and error tracking.

### Database & Performance
- Improved database sync and health checks.
- Auto-recovery and memory management enhancements.
- Command queueing and rate limiting for stability.

All new features and best practices documented in `docs/`.

---

## 📅 For a full changelog, see commit history or the main README.

