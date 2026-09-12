// O'qituvchi hisoblari — Google/Telegram orqali kirgandan keyin shu jadvalda saqlanadi.

import { randomUUID } from 'node:crypto'
import { db } from './db.js'
import { buildSampleQuiz } from './seedQuiz.js'

const findStmt = db.prepare('SELECT * FROM teachers WHERE provider = ? AND provider_id = ?')
const insertStmt = db.prepare(`
  INSERT INTO teachers (id, provider, provider_id, name, email, avatar, created_at)
  VALUES (@id, @provider, @provider_id, @name, @email, @avatar, @created_at)
`)
const updateStmt = db.prepare(
  'UPDATE teachers SET name = @name, email = @email, avatar = @avatar WHERE id = @id',
)
const byIdStmt = db.prepare('SELECT * FROM teachers WHERE id = ?')
const updateAvatarStmt = db.prepare('UPDATE teachers SET avatar = @avatar WHERE id = @id')
const setVerifiedStmt = db.prepare('UPDATE teachers SET is_verified = @is_verified WHERE id = @id')
const insertQuizStmt = db.prepare(
  'INSERT INTO quizzes (id, teacher_id, data, updated_at) VALUES (?, ?, ?, ?)',
)

/** Google/Telegram profilidan o'qituvchini topadi yoki yangi hisob ochadi (+ namuna test) */
export function upsertTeacher({ provider, providerId, name, email, avatar }) {
  const existing = findStmt.get(provider, providerId)
  if (existing) {
    updateStmt.run({
      id: existing.id,
      name: name || existing.name,
      email: email ?? existing.email,
      avatar: avatar ?? existing.avatar,
    })
    return byIdStmt.get(existing.id)
  }

  const id = randomUUID()
  insertStmt.run({
    id,
    provider,
    provider_id: providerId,
    name: name || "O'qituvchi",
    email: email ?? null,
    avatar: avatar ?? null,
    created_at: Date.now(),
  })

  const sample = buildSampleQuiz()
  insertQuizStmt.run(sample.id, id, JSON.stringify(sample), sample.updatedAt)

  return byIdStmt.get(id)
}

export function getTeacherById(id) {
  return byIdStmt.get(id)
}

/** O'qituvchi kamera bilan olgan selfi/profil rasmini yangilaydi (data URL sifatida saqlanadi) */
export function updateAvatar(id, avatar) {
  updateAvatarStmt.run({ id, avatar })
  return byIdStmt.get(id)
}

/** Admin tomonidan tasdiqlash (X/Twitter'dagi ko'k belgiga o'xshash) */
export function setVerified(id, verified) {
  setVerifiedStmt.run({ id, is_verified: verified ? 1 : 0 })
  return byIdStmt.get(id)
}

/** Klientga yuboriladigan xavfsiz maydonlar */
export function publicTeacher(t) {
  if (!t) return null
  return {
    id: t.id,
    provider: t.provider,
    name: t.name,
    email: t.email,
    avatar: t.avatar,
    isVerified: Boolean(t.is_verified),
  }
}
