-- SQLite schema for Nexus Bot (no Prisma)
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  name TEXT,
  exp INTEGER DEFAULT 0,
  money INTEGER DEFAULT 0,
  role INTEGER DEFAULT 0
);

-- Groups Table
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT,
  settings TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  type TEXT,
  amount INTEGER,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES user(id)
);

-- Group Members Table
CREATE TABLE IF NOT EXISTS group_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  group_id TEXT,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  role TEXT DEFAULT 'member',
  UNIQUE(user_id, group_id)
);

-- Thread Prefixes Table
CREATE TABLE IF NOT EXISTS thread_prefixes (
  thread_id TEXT PRIMARY KEY,
  prefix TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thread Admins Table
CREATE TABLE IF NOT EXISTS thread_admins (
  thread_id TEXT,
  user_id TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (thread_id, user_id)
);

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id TEXT PRIMARY KEY,
  role INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Keywords Table
CREATE TABLE IF NOT EXISTS keywords (
  id TEXT PRIMARY KEY,
  trigger_word TEXT NOT NULL,
  response TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Command Usage Analytics
CREATE TABLE IF NOT EXISTS command_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  command TEXT,
  user_id TEXT,
  thread_id TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  execution_time INTEGER,
  success BOOLEAN
);

-- User Activity Analytics
CREATE TABLE IF NOT EXISTS user_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  thread_id TEXT,
  activity_type TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  details TEXT
);

-- Error Logs
CREATE TABLE IF NOT EXISTS error_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  error_type TEXT,
  error_message TEXT,
  stack_trace TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  additional_data TEXT
);
