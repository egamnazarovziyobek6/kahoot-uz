// SQLite ombori — o'qituvchilar va ularning testlari shu yerda saqlanadi.
// Fayl asosida, alohida DB serveri shart emas (server/data/kahoot.sqlite).

import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'kahoot.sqlite')

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

export const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    avatar TEXT,
    created_at INTEGER NOT NULL,
    UNIQUE(provider, provider_id)
  );

  CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_quizzes_teacher ON quizzes(teacher_id);
`)
