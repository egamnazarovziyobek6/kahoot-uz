// Test CRUD API — client/src/lib/quizStore.js shu endpoint'larga murojaat qiladi.
// Har bir qator butun test JSON'ini saqlaydi — client'dagi quiz.js data-modeli o'zgarmaydi.

import { Router } from 'express'
import { db } from './db.js'
import { requireAuth } from './auth.js'

const listStmt = db.prepare(
  'SELECT data FROM quizzes WHERE teacher_id = ? ORDER BY updated_at DESC',
)
const getStmt = db.prepare('SELECT data FROM quizzes WHERE id = ? AND teacher_id = ?')
const insertStmt = db.prepare(
  'INSERT INTO quizzes (id, teacher_id, data, updated_at, created_at) VALUES (?, ?, ?, ?, ?)',
)
const updateStmt = db.prepare(
  'UPDATE quizzes SET data = ?, updated_at = ? WHERE id = ? AND teacher_id = ?',
)
const deleteStmt = db.prepare('DELETE FROM quizzes WHERE id = ? AND teacher_id = ?')

function parseRow(row) {
  return JSON.parse(row.data)
}

export const quizzesRouter = Router()
quizzesRouter.use(requireAuth)

quizzesRouter.get('/', (req, res) => {
  res.json(listStmt.all(req.teacher.id).map(parseRow))
})

quizzesRouter.get('/:id', (req, res) => {
  const row = getStmt.get(req.params.id, req.teacher.id)
  if (!row) return res.status(404).json({ error: 'Test topilmadi' })
  res.json(parseRow(row))
})

// Upsert: quiz.id mavjud bo'lsa yangilanadi, bo'lmasa yaratiladi (avtomatik saqlash shu yerga tushadi)
quizzesRouter.post('/', (req, res) => {
  const quiz = req.body
  if (!quiz?.id || typeof quiz.id !== 'string') {
    return res.status(400).json({ error: 'quiz.id kerak' })
  }
  const now = Date.now()
  const next = { ...quiz, updatedAt: now }
  const payload = JSON.stringify(next)
  const existing = getStmt.get(quiz.id, req.teacher.id)
  if (existing) updateStmt.run(payload, now, quiz.id, req.teacher.id)
  else insertStmt.run(quiz.id, req.teacher.id, payload, now, now)
  res.json(next)
})

quizzesRouter.delete('/:id', (req, res) => {
  deleteStmt.run(req.params.id, req.teacher.id)
  res.json({ ok: true })
})
