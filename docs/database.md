# Database Schema Reference

Nexus Bot uses SQLite for fast, reliable storage. Here are the main tables and their structure.

---

## 👤 Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  exp INTEGER DEFAULT 0,
  money INTEGER DEFAULT 0,
  daily_streak INTEGER DEFAULT 0,
  last_daily DATETIME,
  role INTEGER DEFAULT 0,
  banned BOOLEAN DEFAULT 0,
  ban_reason TEXT,
  warns INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 👥 Groups Table
```sql
CREATE TABLE groups (
  id TEXT PRIMARY KEY,
  name TEXT,
  settings TEXT,
  welcome_message TEXT,
  rules TEXT,
  banned BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 💸 Transactions Table
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  type TEXT,
  amount INTEGER,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
```

---
