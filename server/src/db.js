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

  CREATE TABLE IF NOT EXISTS forum_posts (
    id TEXT PRIMARY KEY,
    author_type TEXT NOT NULL, -- 'teacher' | 'guest'
    author_id TEXT,            -- teacher_id agar author_type='teacher' bo'lsa
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    repost_of TEXT REFERENCES forum_posts(id),
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at DESC);

  CREATE TABLE IF NOT EXISTS forum_reactions (
    post_id TEXT NOT NULL,
    liker_key TEXT NOT NULL, -- teacher_id yoki mehmon uchun brauzerda saqlangan tasodifiy kalit
    emoji TEXT NOT NULL,
    PRIMARY KEY (post_id, liker_key)
  );

  CREATE TABLE IF NOT EXISTS game_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
    quiz_id TEXT,
    pin TEXT NOT NULL,
    player_count INTEGER NOT NULL,
    ended_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_game_history_ended ON game_history(ended_at);

  CREATE TABLE IF NOT EXISTS moderation_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    photo TEXT,
    video_sent INTEGER NOT NULL DEFAULT 0,
    submitted_at INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
    reviewed_at INTEGER,
    reviewed_by TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_moderation_submitted ON moderation_log(submitted_at DESC);
`)

// Eski bazalarda mavjud bo'lmagan ustunlarni qo'shib qo'yamiz (migratsiya)
const teacherColumns = db.prepare('PRAGMA table_info(teachers)').all().map((c) => c.name)
if (!teacherColumns.includes('is_verified')) {
  db.exec('ALTER TABLE teachers ADD COLUMN is_verified INTEGER NOT NULL DEFAULT 0')
}
if (!teacherColumns.includes('is_blocked')) {
  db.exec('ALTER TABLE teachers ADD COLUMN is_blocked INTEGER NOT NULL DEFAULT 0')
}
if (!teacherColumns.includes('is_admin')) {
  db.exec('ALTER TABLE teachers ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0')
}

const forumPostColumns = db.prepare('PRAGMA table_info(forum_posts)').all().map((c) => c.name)
if (!forumPostColumns.includes('repost_of')) {
  db.exec('ALTER TABLE forum_posts ADD COLUMN repost_of TEXT REFERENCES forum_posts(id)')
}

const quizColumns = db.prepare('PRAGMA table_info(quizzes)').all().map((c) => c.name)
if (!quizColumns.includes('created_at')) {
  db.exec('ALTER TABLE quizzes ADD COLUMN created_at INTEGER')
  db.exec('UPDATE quizzes SET created_at = updated_at WHERE created_at IS NULL')
}

db.exec('DROP TABLE IF EXISTS forum_likes')
