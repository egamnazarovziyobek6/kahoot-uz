// Forum — o'qituvchi va o'quvchilar (mehmon sifatida) fikr almashadigan ochiq lenta.
// O'qituvchi postlari uning hisobiga bog'lanadi (ism/rasm/tasdiqlash belgisi joriy holatidan olinadi),
// o'quvchi (mehmon) postlari esa faqat kiritilgan ism bilan, hisobsiz saqlanadi.

import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { db } from './db.js'
import { optionalAuth } from './auth.js'

const MAX_CONTENT = 500
const PAGE_SIZE = 20
export const REACTIONS = ['like', 'love', 'haha', 'wow', 'sad', 'angry']

const insertPostStmt = db.prepare(`
  INSERT INTO forum_posts (id, author_type, author_id, author_name, author_avatar, content, repost_of, created_at)
  VALUES (@id, @author_type, @author_id, @author_name, @author_avatar, @content, @repost_of, @created_at)
`)

const pageStmt = db.prepare(`
  SELECT p.id, p.author_type, p.author_id, p.author_name, p.author_avatar, p.content, p.created_at, p.repost_of,
    t.name AS teacher_name, t.avatar AS teacher_avatar, t.is_verified AS teacher_verified,
    orig.author_type AS orig_author_type, orig.author_id AS orig_author_id,
    orig.author_name AS orig_author_name, orig.author_avatar AS orig_author_avatar,
    orig.content AS orig_content, orig.created_at AS orig_created_at,
    ot.name AS orig_teacher_name, ot.avatar AS orig_teacher_avatar, ot.is_verified AS orig_teacher_verified
  FROM forum_posts p
  LEFT JOIN teachers t ON p.author_type = 'teacher' AND t.id = p.author_id
  LEFT JOIN forum_posts orig ON orig.id = p.repost_of
  LEFT JOIN teachers ot ON orig.author_type = 'teacher' AND ot.id = orig.author_id
  WHERE (@cursor IS NULL OR p.created_at < @cursor)
  ORDER BY p.created_at DESC
  LIMIT @limit
`)

const deletePostStmt = db.prepare('DELETE FROM forum_posts WHERE id = ?')
const getPostStmt = db.prepare('SELECT * FROM forum_posts WHERE id = ?')
const reactStmt = db.prepare(`
  INSERT INTO forum_reactions (post_id, liker_key, emoji) VALUES (?, ?, ?)
  ON CONFLICT(post_id, liker_key) DO UPDATE SET emoji = excluded.emoji
`)
const unreactStmt = db.prepare('DELETE FROM forum_reactions WHERE post_id = ? AND liker_key = ?')
const myReactionStmt = db.prepare('SELECT emoji FROM forum_reactions WHERE post_id = ? AND liker_key = ?')
const reactionCountsStmt = db.prepare(
  'SELECT emoji, COUNT(*) AS n FROM forum_reactions WHERE post_id = ? GROUP BY emoji',
)

function reactionSummary(postId) {
  const counts = {}
  for (const r of reactionCountsStmt.all(postId)) counts[r.emoji] = r.n
  return counts
}

function shapeAuthor(row, prefix) {
  const isTeacher = row[`${prefix}author_type`] === 'teacher'
  return {
    authorType: row[`${prefix}author_type`],
    authorId: row[`${prefix}author_id`],
    name: isTeacher ? row[`${prefix}teacher_name`] || row[`${prefix}author_name`] : row[`${prefix}author_name`],
    avatar: isTeacher ? row[`${prefix}teacher_avatar`] || row[`${prefix}author_avatar`] : row[`${prefix}author_avatar`],
    isVerified: isTeacher && Boolean(row[`${prefix}teacher_verified`]),
  }
}

function shapePost(row, likerKey) {
  const base = {
    id: row.id,
    ...shapeAuthor(row, ''),
    content: row.content,
    createdAt: row.created_at,
    reactions: reactionSummary(row.id),
    myReaction: likerKey ? myReactionStmt.get(row.id, likerKey)?.emoji || null : null,
    repostOf: null,
  }

  if (row.repost_of) {
    base.repostOf = row.orig_author_type
      ? { ...shapeAuthor(row, 'orig_'), content: row.orig_content, createdAt: row.orig_created_at }
      : { deleted: true }
  }

  return base
}

export function deletePost(id) {
  deletePostStmt.run(id)
}

export const forumRouter = Router()

forumRouter.get('/posts', optionalAuth, (req, res) => {
  const cursor = req.query.cursor ? Number(req.query.cursor) : null
  const rows = pageStmt.all({ cursor, limit: PAGE_SIZE })
  const likerKey = req.teacher?.id || (typeof req.query.guestKey === 'string' ? req.query.guestKey : null)

  const posts = rows.map((r) => shapePost(r, likerKey))
  const nextCursor = rows.length === PAGE_SIZE ? rows[rows.length - 1].created_at : null
  res.json({ posts, nextCursor })
})

function resolveAuthor(req) {
  if (req.teacher) {
    return {
      author_type: 'teacher',
      author_id: req.teacher.id,
      author_name: req.teacher.name,
      author_avatar: req.teacher.avatar,
    }
  }
  const guestName = String(req.body?.guestName || '').trim().slice(0, 40)
  if (!guestName) return null
  return { author_type: 'guest', author_id: null, author_name: guestName, author_avatar: null }
}

forumRouter.post('/posts', optionalAuth, (req, res) => {
  const content = String(req.body?.content || '').trim()
  if (!content) return res.status(400).json({ error: "Post matni bo'sh bo'lishi mumkin emas" })
  if (content.length > MAX_CONTENT) {
    return res.status(400).json({ error: `Post ${MAX_CONTENT} belgidan oshmasligi kerak` })
  }

  const author = resolveAuthor(req)
  if (!author) return res.status(400).json({ error: 'Ismingizni kiriting' })

  const post = { id: randomUUID(), content, repost_of: null, created_at: Date.now(), ...author }
  insertPostStmt.run(post)
  res.json(shapePost(getFullRow(post.id), req.teacher?.id))
})

function getFullRow(id) {
  return db
    .prepare(
      `SELECT p.id, p.author_type, p.author_id, p.author_name, p.author_avatar, p.content, p.created_at, p.repost_of,
        t.name AS teacher_name, t.avatar AS teacher_avatar, t.is_verified AS teacher_verified,
        orig.author_type AS orig_author_type, orig.author_id AS orig_author_id,
        orig.author_name AS orig_author_name, orig.author_avatar AS orig_author_avatar,
        orig.content AS orig_content, orig.created_at AS orig_created_at,
        ot.name AS orig_teacher_name, ot.avatar AS orig_teacher_avatar, ot.is_verified AS orig_teacher_verified
      FROM forum_posts p
      LEFT JOIN teachers t ON p.author_type = 'teacher' AND t.id = p.author_id
      LEFT JOIN forum_posts orig ON orig.id = p.repost_of
      LEFT JOIN teachers ot ON orig.author_type = 'teacher' AND ot.id = orig.author_id
      WHERE p.id = ?`,
    )
    .get(id)
}

forumRouter.post('/posts/:id/repost', optionalAuth, (req, res) => {
  const original = getPostStmt.get(req.params.id)
  if (!original) return res.status(404).json({ error: 'Topilmadi' })

  const author = resolveAuthor(req)
  if (!author) return res.status(400).json({ error: 'Ismingizni kiriting' })

  const post = { id: randomUUID(), content: '', repost_of: original.id, created_at: Date.now(), ...author }
  insertPostStmt.run(post)
  res.json(shapePost(getFullRow(post.id), req.teacher?.id))
})

forumRouter.delete('/posts/:id', optionalAuth, (req, res) => {
  const post = getPostStmt.get(req.params.id)
  if (!post) return res.status(404).json({ error: 'Topilmadi' })
  if (post.author_type !== 'teacher' || post.author_id !== req.teacher?.id) {
    return res.status(403).json({ error: "Faqat o'z postingizni o'chira olasiz" })
  }
  deletePostStmt.run(req.params.id)
  res.json({ ok: true })
})

forumRouter.post('/posts/:id/react', optionalAuth, (req, res) => {
  const emoji = req.body?.emoji
  if (!REACTIONS.includes(emoji)) return res.status(400).json({ error: "Noto'g'ri emoji" })
  const likerKey = req.teacher?.id || String(req.body?.guestKey || '')
  if (!likerKey) return res.status(400).json({ error: 'guestKey kerak' })
  const post = getPostStmt.get(req.params.id)
  if (!post) return res.status(404).json({ error: 'Topilmadi' })

  const current = myReactionStmt.get(req.params.id, likerKey)
  if (current?.emoji === emoji) unreactStmt.run(req.params.id, likerKey)
  else reactStmt.run(req.params.id, likerKey, emoji)

  res.json({
    myReaction: current?.emoji === emoji ? null : emoji,
    reactions: reactionSummary(req.params.id),
  })
})
