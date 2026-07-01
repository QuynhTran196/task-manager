// File nay tao database va dinh nghia cau truc bang (schema)
// Chay 1 lan duy nhat khi server khoi dong, neu bang da ton tai thi bo qua

const Database = require('better-sqlite3');
const path = require('path');

// Database luu thanh file task_manager.db trong thu muc goc backend
const dbPath = path.join(__dirname, '..', '..', 'task_manager.db');
const db = new Database(dbPath);

// Bat foreign key constraint - bat buoc voi SQLite vi mac dinh la TAT
db.pragma('foreign_keys = ON');

function initSchema() {
  // Bang USERS - moi nguoi dung he thong
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bang GROUPS - cac nhom lam viec
  db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      manager_id INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES users(id)
    )
  `);

  // Bang GROUP_MEMBERS - quan he nhieu-nhieu giua user va group
  // 1 user co the thuoc nhieu group, 1 group co nhieu member (theo spec da chot)
  db.exec(`
    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(group_id, user_id)
    )
  `);

  // Bang TASKS - cac task trong nhom, duoc tao boi manager va gan cho member
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      deadline TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending',
      assigned_to INTEGER,
      group_id INTEGER NOT NULL,
      attachment TEXT,
      created_by INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Bang SUBTASKS - cac subtask thuoc ve 1 task, chi 1 cap (khong long nhau)
  // is_completed: 0 = chua xong, 1 = xong - tick thu cong, sua noi dung khong reset
  db.exec(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      deadline TEXT,
      priority TEXT DEFAULT 'medium',
      is_completed INTEGER DEFAULT 0,
      attachment TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `);

  console.log('[DB] Schema da san sang: users, groups, group_members, tasks, subtasks');
}

module.exports = { db, initSchema };
