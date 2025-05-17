const path = require('path');
const fs = require('fs');
const logger = require('../nexus-core/logger');
const { getDb } = require('./sqlite');

// Always use ./database/data.sqlite for SQLite
const DB_ROOT = path.join(process.cwd(), 'database');
const DB_FILE = path.join(DB_ROOT, 'data.sqlite');

// Database directory structure
const BACKUP_DIR = path.join(DB_ROOT, 'backups');
const TEMP_DIR = path.join(DB_ROOT, 'temp');

// Ensure all directories exist
[DB_ROOT, BACKUP_DIR, TEMP_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

class DatabaseManager {
  constructor() {
    this.cache = new Map();
  }

  async getUser(id) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.get('SELECT * FROM user WHERE id = ?', [id], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  async createUser(id, name) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.run('INSERT OR IGNORE INTO user (id, name) VALUES (?, ?)', [id, name], function(err) {
        db.close();
        if (err) return reject(err);
        resolve({ id, name });
      });
    });
  }

  async updateExp(id, amount) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.run('UPDATE user SET exp = exp + ? WHERE id = ?', [amount, id], function(err) {
        db.close();
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async updateMoney(id, amount) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.run('UPDATE user SET money = money + ? WHERE id = ?', [amount, id], function(err) {
        db.close();
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async countUsers() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row.count);
      });
    });
  }

  async countGroups() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.get('SELECT COUNT(*) as count FROM groups', [], (err, row) => {
        db.close();
        if (err) return reject(err);
        resolve(row.count);
      });
    });
  }
}

module.exports = new DatabaseManager();
