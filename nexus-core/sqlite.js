// Simple SQLite wrapper using sqlite3
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(process.cwd(), 'database', 'data.sqlite');

function getDb() {
  return new sqlite3.Database(DB_PATH);
}

module.exports = { getDb };
