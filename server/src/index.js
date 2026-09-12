import 'dotenv/config'
import { createServer } from 'node:http'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import passport from 'passport'
import { Server } from 'socket.io'
import { authRouter, socketTeacher } from './auth.js'
import { adminRouter } from './admin.js'
import { aiRouter } from './ai/router.js'
import { CLIENT_ORIGINS } from './clientOrigins.js'
import { db } from './db.js'
import { checkAnswer, computePoints, publicQuestion } from './gameLogic.js'
import { quizzesRouter } from './quizzes.js'
import {
  addPlayer,
  closeRoom,
  createRoom,
  getRoom,
  playerList,
  removePlayer,
} from './rooms.js'

const PORT = process.env.PORT || 4000

const app = express()
app.use(cors({ origin: CLIENT_ORIGINS, credentials: true }))
app.use(cookieParser())
app.use(express.json({ limit: '2mb' }))
app.use(passport.initialize())

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'kahoot-uz-server' }))
app.use('/api/auth', authRouter)
app.use('/api/quizzes', quizzesRouter)
app.use('/api/ai', aiRouter)
app.use('/api/admin', adminRouter)

const getOwnedQuizStmt = db.prepare('SELECT data FROM quizzes WHERE id = ? AND teacher_id = ?')

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: CLIENT_ORIGINS, credentials: true } })

// Har bir socket ulanishida xuddi shu auth cookie'dan o'qituvchini aniqlaymiz.
// O'quvchi uchun bu har doim null — PIN bilan qo'shilish hech qanday auth talab qilmaydi.
io.use((socket, next) => {
  socket.data.teacher = socketTeacher(socket)
  next()
})

function emitProgress(pin, room) {
  const question = room.game.quiz.questions[room.game.index]
  const answered = room.game.answers.get(question.id)?.size ?? 0
  io.to(pin).emit('answer:progress', { answered, total: room.players.size })
}

/** Keyingi savolga o'tadi (yoki savol qolmasa o'yinni yakunlaydi) */
function advanceQuestion(pin) {
  const room = getRoom(pin)
  if (!room || !room.game) return
  if (room.game.timer) {
    clearTimeout(room.game.timer)
    room.game.timer = null
  }

  room.game.index += 1
  const question = room.game.quiz.questions[room.game.index]

  if (!question) {
    finishGame(pin)
    return
  }

  room.game.answers.set(question.id, new Map())
  room.game.questionStartedAt = Date.now()

  io.to(pin).emit('question:show', {
    index: room.game.index,
    total: room.game.quiz.questions.length,
    question: publicQuestion(question),
  })
  emitProgress(pin, room)

  // Vaqt tugasa avtomatik o'tadi (+ozgina tarmoq kechikishi uchun bufer)
  room.game.timer = setTimeout(() => advanceQuestion(pin), question.timeLimit * 1000 + 300)
}

/** O'yinni yakunlaydi — reyting va har savol bo'yicha to'liq sharh shu yerda birinchi marta ochiladi */
function finishGame(pin) {
  const room = getRoom(pin)
  if (!room || !room.game) return
  room.status = 'ended'
  const { quiz, answers } = room.game

  const leaderboard = playerList(room)
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ ...p, rank: i + 1 }))

  const review = quiz.questions.map((q) => {
    const given = answers.get(q.id) ?? new Map()
    return {
      id: q.id,
      text: q.text,
      type: q.type,
      correctAnswers:
        q.type === 'input'
          ? q.answers.map((a) => a.text)
          : q.answers.filter((a) => a.correct).map((a) => a.text),
      players: [...given.entries()].map(([playerId, a]) => ({
        playerId,
        name: room.players.get(playerId)?.name ?? '—',
        correct: a.correct,
        points: a.points,
      })),
    }
  })

  io.to(pin).emit('game:ended', { leaderboard, review })
  room.game = null
}

io.on('connection', (socket) => {
  // ---- HOST (o'qituvchi ekrani) ----
  socket.on('host:create', (_payload, ack) => {
    const teacher = socket.data.teacher
    if (!teacher) return ack?.({ error: 'Avval tizimga kiring' })
    const room = createRoom(socket.id, teacher.id)
    socket.join(room.pin)
    socket.data.role = 'host'
    socket.data.pin = room.pin
    ack?.({ pin: room.pin })
  })

  socket.on('host:start', ({ quizId } = {}, ack) => {
    const pin = socket.data.pin
    const room = getRoom(pin)
    if (!room || room.hostId !== socket.id) return ack?.({ error: 'Xona topilmadi' })
    if (room.players.size === 0) return ack?.({ error: "Kamida bitta o'yinchi qo'shilishi kerak" })

    const row = getOwnedQuizStmt.get(quizId, room.teacherId)
    if (!row) return ack?.({ error: 'Test topilmadi' })
    const quiz = JSON.parse(row.data)
    if (!quiz.questions?.length) return ack?.({ error: "Testda savol yo'q" })

    room.status = 'active'
    room.quizId = quizId
    room.game = { quiz, index: -1, answers: new Map(), questionStartedAt: 0, timer: null }

    io.to(pin).emit('game:started', { title: quiz.title, total: quiz.questions.length })
    ack?.({ ok: true })
    advanceQuestion(pin)
  })

  // Host savolni muddatidan oldin qo'lda o'tkazib yuborishi mumkin
  socket.on('host:skip', () => {
    const room = getRoom(socket.data.pin)
    if (!room || room.hostId !== socket.id || !room.game) return
    advanceQuestion(socket.data.pin)
  })

  // ---- PLAYER (o'quvchi telefoni) ----
  socket.on('player:join', ({ pin, name, character }, ack) => {
    const result = addPlayer(pin, { id: socket.id, name: String(name || '').trim(), character })
    if (result.error) return ack?.({ error: result.error })
    socket.join(pin)
    socket.data.role = 'player'
    socket.data.pin = pin
    ack?.({ ok: true, pin })
    io.to(pin).emit('lobby:update', { players: playerList(result.room) })
  })

  socket.on('answer:submit', ({ value } = {}, ack) => {
    const room = getRoom(socket.data.pin)
    if (!room || !room.game) return ack?.({ error: "O'yin faol emas" })
    const question = room.game.quiz.questions[room.game.index]
    if (!question) return ack?.({ error: 'Savol topilmadi' })
    const answersForQ = room.game.answers.get(question.id)
    if (answersForQ.has(socket.id)) return ack?.({ error: 'Allaqachon javob berdingiz' })

    const elapsedMs = Date.now() - room.game.questionStartedAt
    const correct = checkAnswer(question, value)
    const points = computePoints({
      correct,
      timeLimit: question.timeLimit,
      elapsedMs,
      points: question.points,
    })
    answersForQ.set(socket.id, { value, correct, points })

    const player = room.players.get(socket.id)
    if (player) player.score += points

    // Ataylab: bu yerda to'g'ri/noto'g'ri haqida hech narsa yo'q — natijalar faqat o'yin oxirida ochiladi
    ack?.({ ok: true })
    emitProgress(socket.data.pin, room)

    if (answersForQ.size >= room.players.size) {
      advanceQuestion(socket.data.pin)
    }
  })

  socket.on('disconnect', () => {
    if (socket.data.role === 'host') {
      const room = closeRoom(socket.id)
      if (room) io.to(room.pin).emit('game:closed')
    } else if (socket.data.role === 'player') {
      const room = removePlayer(socket.id)
      if (room) io.to(room.pin).emit('lobby:update', { players: playerList(room) })
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`Kahoot UZ server → http://localhost:${PORT}`)
})
