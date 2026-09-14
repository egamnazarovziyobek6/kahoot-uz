// Admin panel API — faqat server/.env dagi ADMIN_EMAILS ro'yxatidagi hisoblar kira oladi.

import { Router } from 'express'
import { db } from './db.js'
import { requireAdmin } from './auth.js'
import {
  setVerified,
  setBlocked,
  setAdminFlag,
  updateTeacherFields,
  getTeacherById,
  listQuizzesByTeacher,
} from './teachers.js'
import { listRooms } from './rooms.js'
import { deletePost } from './forum.js'

const teachersStmt = db.prepare(`
  SELECT t.id, t.provider, t.name, t.email, t.avatar, t.created_at, t.is_verified, t.is_blocked, t.is_admin,
    (SELECT COUNT(*) FROM quizzes q WHERE q.teacher_id = t.id) AS quiz_count
  FROM teachers t
  ORDER BY t.created_at DESC
`)
const deleteTeacherStmt = db.prepare('DELETE FROM teachers WHERE id = ?')
const forumPostsByAuthorStmt = db.prepare(
  'SELECT id, content, created_at FROM forum_posts WHERE author_type = ? AND author_id = ? ORDER BY created_at DESC',
)

function shapeTeacher(t) {
  return {
    id: t.id,
    provider: t.provider,
    name: t.name,
    email: t.email,
    avatar: t.avatar,
    createdAt: t.created_at,
    quizCount: t.quiz_count,
    isVerified: Boolean(t.is_verified),
    isBlocked: Boolean(t.is_blocked),
    isAdmin: Boolean(t.is_admin),
  }
}

const quizzesStmt = db.prepare(`
  SELECT quizzes.id, quizzes.teacher_id, quizzes.data, quizzes.updated_at, teachers.name AS teacher_name
  FROM quizzes
  JOIN teachers ON teachers.id = quizzes.teacher_id
  ORDER BY quizzes.updated_at DESC
`)
const deleteQuizStmt = db.prepare('DELETE FROM quizzes WHERE id = ?')

const countTeachersStmt = db.prepare('SELECT COUNT(*) AS n FROM teachers')
const countQuizzesStmt = db.prepare('SELECT COUNT(*) AS n FROM quizzes')

const DAY_MS = 24 * 60 * 60 * 1000
const signupsByDayStmt = db.prepare(
  "SELECT date(created_at/1000, 'unixepoch') AS day, COUNT(*) AS n FROM teachers GROUP BY day",
)
const quizzesByDayStmt = db.prepare(
  "SELECT date(created_at/1000, 'unixepoch') AS day, COUNT(*) AS n FROM quizzes GROUP BY day",
)
const gamesByDayStmt = db.prepare(
  "SELECT date(ended_at/1000, 'unixepoch') AS day, COUNT(*) AS n FROM game_history GROUP BY day",
)

/** So'nggi `days` kun uchun kunlik sonlarni 0 bilan to'ldirib qaytaradi */
function dailyCounts(stmt, days) {
  const map = new Map(stmt.all().map((r) => [r.day, r.n]))
  const out = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(today.getTime() - i * DAY_MS).toISOString().slice(0, 10)
    out.push({ day: key, count: map.get(key) ?? 0 })
  }
  return out
}

const moderationStmt = db.prepare(`
  SELECT m.id, m.teacher_id, m.photo, m.video_sent, m.submitted_at, m.status, m.reviewed_at, m.reviewed_by,
    t.name AS teacher_name
  FROM moderation_log m
  JOIN teachers t ON t.id = m.teacher_id
  ORDER BY m.submitted_at DESC
  LIMIT 50
`)
const updateModerationStmt = db.prepare(
  'UPDATE moderation_log SET status = ?, reviewed_at = ?, reviewed_by = ? WHERE id = ?',
)

function shapeModeration(m) {
  return {
    id: m.id,
    teacherId: m.teacher_id,
    teacherName: m.teacher_name,
    photo: m.photo,
    videoSent: Boolean(m.video_sent),
    submittedAt: m.submitted_at,
    status: m.status,
    reviewedAt: m.reviewed_at,
    reviewedBy: m.reviewed_by,
  }
}

export const adminRouter = Router()
adminRouter.use(requireAdmin)

adminRouter.get('/stats', (_req, res) => {
  res.json({
    teacherCount: countTeachersStmt.get().n,
    quizCount: countQuizzesStmt.get().n,
    activeRooms: listRooms().length,
  })
})

adminRouter.get('/stats-daily', (req, res) => {
  const days = Math.min(90, Math.max(1, Number(req.query.days) || 30))
  res.json({
    signups: dailyCounts(signupsByDayStmt, days),
    quizzesCreated: dailyCounts(quizzesByDayStmt, days),
    gamesPlayed: dailyCounts(gamesByDayStmt, days),
  })
})

adminRouter.get('/moderation', (_req, res) => {
  res.json(moderationStmt.all().map(shapeModeration))
})

adminRouter.put('/moderation/:id', (req, res) => {
  const status = req.body?.status
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: "Noto'g'ri holat" })
  }
  updateModerationStmt.run(status, Date.now(), req.teacher?.name ?? null, req.params.id)
  res.json({ ok: true })
})

adminRouter.get('/teachers', (_req, res) => {
  res.json(teachersStmt.all().map(shapeTeacher))
})

adminRouter.get('/teachers/:id', (req, res) => {
  const teacher = getTeacherById(req.params.id)
  if (!teacher) return res.status(404).json({ error: 'Topilmadi' })
  res.json({
    teacher: shapeTeacher({ ...teacher, quiz_count: listQuizzesByTeacher(teacher.id).length }),
    quizzes: listQuizzesByTeacher(teacher.id),
    posts: forumPostsByAuthorStmt.all('teacher', teacher.id).map((p) => ({
      id: p.id,
      content: p.content,
      createdAt: p.created_at,
    })),
  })
})

adminRouter.delete('/teachers/:id', (req, res) => {
  deleteTeacherStmt.run(req.params.id)
  res.json({ ok: true })
})

adminRouter.put('/teachers/:id', (req, res) => {
  const teacher = updateTeacherFields(req.params.id, {
    name: req.body?.name,
    email: req.body?.email,
  })
  if (!teacher) return res.status(404).json({ error: 'Topilmadi' })
  res.json({ ok: true })
})

adminRouter.put('/teachers/:id/verify', (req, res) => {
  const teacher = setVerified(req.params.id, Boolean(req.body?.verified))
  if (!teacher) return res.status(404).json({ error: 'Topilmadi' })
  res.json({ ok: true })
})

adminRouter.put('/teachers/:id/block', (req, res) => {
  const teacher = setBlocked(req.params.id, Boolean(req.body?.blocked))
  if (!teacher) return res.status(404).json({ error: 'Topilmadi' })
  res.json({ ok: true })
})

adminRouter.put('/teachers/:id/admin', (req, res) => {
  const teacher = setAdminFlag(req.params.id, Boolean(req.body?.isAdmin))
  if (!teacher) return res.status(404).json({ error: 'Topilmadi' })
  res.json({ ok: true })
})

adminRouter.get('/quizzes', (_req, res) => {
  res.json(
    quizzesStmt.all().map((row) => {
      const quiz = JSON.parse(row.data)
      return {
        id: row.id,
        teacherId: row.teacher_id,
        teacherName: row.teacher_name,
        updatedAt: row.updated_at,
        title: quiz.title,
        questionCount: quiz.questions?.length ?? 0,
      }
    }),
  )
})

adminRouter.delete('/quizzes/:id', (req, res) => {
  deleteQuizStmt.run(req.params.id)
  res.json({ ok: true })
})

adminRouter.get('/rooms', (_req, res) => {
  res.json(listRooms())
})

adminRouter.delete('/forum/posts/:id', (req, res) => {
  deletePost(req.params.id)
  res.json({ ok: true })
})
