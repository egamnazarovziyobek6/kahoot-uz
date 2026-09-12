// Admin panel API — faqat server/.env dagi ADMIN_EMAILS ro'yxatidagi hisoblar kira oladi.

import { Router } from 'express'
import { db } from './db.js'
import { requireAdmin } from './auth.js'
import { listRooms } from './rooms.js'

const teachersStmt = db.prepare(`
  SELECT t.id, t.provider, t.name, t.email, t.avatar, t.created_at,
    (SELECT COUNT(*) FROM quizzes q WHERE q.teacher_id = t.id) AS quiz_count
  FROM teachers t
  ORDER BY t.created_at DESC
`)
const deleteTeacherStmt = db.prepare('DELETE FROM teachers WHERE id = ?')

const quizzesStmt = db.prepare(`
  SELECT quizzes.id, quizzes.teacher_id, quizzes.data, quizzes.updated_at, teachers.name AS teacher_name
  FROM quizzes
  JOIN teachers ON teachers.id = quizzes.teacher_id
  ORDER BY quizzes.updated_at DESC
`)
const deleteQuizStmt = db.prepare('DELETE FROM quizzes WHERE id = ?')

const countTeachersStmt = db.prepare('SELECT COUNT(*) AS n FROM teachers')
const countQuizzesStmt = db.prepare('SELECT COUNT(*) AS n FROM quizzes')

export const adminRouter = Router()
adminRouter.use(requireAdmin)

adminRouter.get('/stats', (_req, res) => {
  res.json({
    teacherCount: countTeachersStmt.get().n,
    quizCount: countQuizzesStmt.get().n,
    activeRooms: listRooms().length,
  })
})

adminRouter.get('/teachers', (_req, res) => {
  res.json(
    teachersStmt.all().map((t) => ({
      id: t.id,
      provider: t.provider,
      name: t.name,
      email: t.email,
      avatar: t.avatar,
      createdAt: t.created_at,
      quizCount: t.quiz_count,
    })),
  )
})

adminRouter.delete('/teachers/:id', (req, res) => {
  deleteTeacherStmt.run(req.params.id)
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
